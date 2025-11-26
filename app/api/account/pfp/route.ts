import { type NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/supabase/server'; 

// Define the structure of the profile expected by the client component (camelCase)
interface ClientProfile {
    userid: string;
    username: string;
    email: string;
    pfpurl: string;
    isdev: boolean;
    accountcreationdate: string;
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
    userid: dbProfile.userid,
    username: dbProfile.username,
    email: dbProfile.email,
    pfpurl: dbProfile.pfpurl,
    isdev: dbProfile.isdev,
    accountcreationdate: dbProfile.accountcreationdate,
});


// POST Handler (Handles file upload to Supabase Storage)
export async function POST(request: NextRequest) {
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
        
        // 1. Determine file path in storage
        const fileExtension = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExtension}`;
        const bucketName = 'avatars'; // Ensure this bucket exists in your Supabase project

        // 2. Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600', // Cache for 1 hour
                upsert: true, // Overwrite if file exists (though timestamped path prevents this)
            });

        if (uploadError) {
            console.error('Supabase Storage Upload Error:', uploadError.message);
            return NextResponse.json({ error: 'Failed to upload image to storage.' }, { status: 500 });
        }

        // 3. Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (!publicUrl) {
             return NextResponse.json({ error: 'Failed to retrieve public URL.' }, { status: 500 });
        }

        // 4. Update the 'users' table with the new pfpurl
        const { data: updatedProfiles, error: dbError } = await supabase
            .from('users')
            .update({ pfpurl: publicUrl })
            .eq('userid', user.id)
            .select() // Select the updated row
            .returns<DatabaseProfile[]>(); 

        if (dbError) {
            console.error('Supabase Database Update Error:', dbError.message);
            return NextResponse.json({ error: 'Failed to update profile picture URL in database.' }, { status: 500 });
        }
        
        if (!updatedProfiles || updatedProfiles.length === 0) {
            return NextResponse.json({ error: 'Profile not found after update.' }, { status: 404 });
        }

        // 5. Return the updated profile
        return NextResponse.json(mapToClientProfile(updatedProfiles[0]), { status: 200 });

    } catch (e) {
        console.error('API Error: Unhandled exception during PFP POST.', e);
        return NextResponse.json({ error: 'Internal server error during upload.' }, { status: 500 });
    }
}