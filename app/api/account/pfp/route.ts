import { type NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/supabase/server'; 

// Define the structure of the profile expected by the client component (camelCase)
interface ClientProfile {
    userID: string;
    username: string;
    email: string;
    pfpURL: string;
    isDev: boolean;
    accountCreationDate: string;
}

// Define the structure of the user profile from the database (snake_case)
interface DatabaseProfile {
    userid: string; 
    username: string;
    email: string;
    pfpurl: string; 
    isdev: boolean;
    accountcreationdate: string;
}

// Helper to map database names to client names
const mapToClientProfile = (dbProfile: DatabaseProfile): ClientProfile => ({
    userID: dbProfile.userid,
    username: dbProfile.username,
    email: dbProfile.email,
    pfpURL: dbProfile.pfpurl,
    isDev: dbProfile.isdev,
    accountCreationDate: dbProfile.accountcreationdate,
});


// POST Handler (Handles file upload to Supabase Storage)
export async function POST(request: NextRequest) {
    // 1. Initialize Supabase client and authenticate user
    const supabase = await createSessionClient(); 
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }
    
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
        }
        
        const bucketName = 'avatars'; // Ensure this bucket exists in your Supabase project

        // 2. Determine file path in storage
        const fileName = `${user.id}-${Date.now()}`;
        const fileExtensionMatch = file.name.match(/\.([0-9a-z]+)$/i);
        const fileExtension = fileExtensionMatch ? fileExtensionMatch[1] : 'jpg'; 
        const filePath = `${user.id}/${fileName}.${fileExtension}`;


        // 3. Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600', 
                upsert: true, 
                contentType: file.type 
            });

        if (uploadError) {
            console.error('Supabase Storage Upload Error:', uploadError.message, uploadError);
            const errorMessage = uploadError.message.includes('permission denied')
                ? 'Permission denied. Check your Supabase Storage RLS policies for the "avatars" bucket.'
                : 'Failed to upload image to storage.';
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }

        // 4. Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (!publicUrl) {
             return NextResponse.json({ error: 'Failed to retrieve public URL after upload.' }, { status: 500 });
        }

        // 5. Update the 'users' table with the new pfpurl
        // We use .update() but skip the .select() part to prevent possible issues on some environments.
        const { error: updateDbError } = await supabase
            .from('users')
            .update({ pfpurl: publicUrl })
            .eq('userid', user.id); 

        if (updateDbError) {
            console.error('Supabase Database Update Error:', updateDbError.message);
            return NextResponse.json({ error: 'Failed to update profile picture URL in database.' }, { status: 500 });
        }
        
        // 6. Dedicated SELECT: Fetch the latest profile data separately for safety
        const { data: latestProfiles, error: fetchError } = await supabase
            .from('users') 
            .select(`userid, username, email, pfpurl, isdev, accountcreationdate`) 
            .eq('userid', user.id) 
            .returns<DatabaseProfile[]>();
        
        if (fetchError || !latestProfiles || latestProfiles.length === 0) {
            console.error('Final Profile Fetch Error:', fetchError?.message || 'No profile found.');
            // Changed the error message to be more explicit about where the failure happened.
            return NextResponse.json({ error: 'Profile URL updated, but failed to retrieve the final profile data.' }, { status: 500 });
        }


        // 7. Return the updated profile
        return NextResponse.json(mapToClientProfile(latestProfiles[0]), { status: 200 });

    } catch (e) {
        console.error('API Error: Unhandled exception during PFP POST.', e);
        return NextResponse.json({ error: 'Internal server error during upload.' }, { status: 500 });
    }
}