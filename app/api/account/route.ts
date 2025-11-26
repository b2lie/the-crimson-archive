import { type NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/supabase/server'; 

// Define the structure of the user object passed to the PUT request
interface UpdateProfilePayload {
    username?: string;
    email?: string;
    isdev?: boolean;
    accountcreationdate?: string;
}

// Define the structure of the user profile from the database (lowercase/snake_case)
interface DatabaseProfile {
    userid: string; 
    username: string;
    email: string;
    pfpurl: string; 
    isdev: boolean;
    accountcreationdate: string;
}

// Define the structure of the profile expected by the client component (camelCase)
interface ClientProfile {
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

// =========================================================================
// GET Handler (Fetches Profile)
// =========================================================================

export async function GET(request: NextRequest) {
    const supabase = await createSessionClient(); 
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }
    
    try {
        const { data: profiles, error: dbError } = await supabase
            .from('users') 
            .select(`userid, username, email, pfpurl, isdev, accountcreationdate`) 
            .eq('userid', user.id) 
            .returns<DatabaseProfile[]>(); 

        if (dbError) {
            console.error('API Error: Supabase GET query failed.', dbError.message);
            return NextResponse.json({ error: 'Database query failed.' }, { status: 500 });
        }

        if (!profiles || profiles.length === 0) {
            return NextResponse.json({ error: 'Profile not found in database.' }, { status: 404 });
        }
        
        return NextResponse.json(mapToClientProfile(profiles[0]), { status: 200 });

    } catch (e) {
        console.error('API Error: Unhandled exception during profile GET.', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// =========================================================================
// PUT Handler (Updates Profile)
// =========================================================================

export async function PUT(request: NextRequest) {
    const supabase = await createSessionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }

    try {
        const payload: UpdateProfilePayload = await request.json();

        if (Object.keys(payload).length === 0) {
            return NextResponse.json({ error: 'No update data provided.' }, { status: 400 });
        }

        // 1. Separate Supabase Auth update (for email) from Profile table update
        const profileUpdates: { username?: string, isdev?: boolean } = {};
        const authUpdates: { email?: string } = {};

        if (payload.username !== undefined) profileUpdates.username = payload.username;
        if (payload.isdev !== undefined) profileUpdates.isdev = payload.isdev;
        if (payload.email !== undefined) authUpdates.email = payload.email;


        // 2. Handle Supabase Auth (Email) update
        if (authUpdates.email) {
            // This correctly uses the method available on the supabase client instance.
            const { error: emailError } = await supabase.auth.updateUser(authUpdates);
            
            // Note: Supabase will send a confirmation email if the email is changed.
            if (emailError) {
                console.error("Supabase Auth Email Update Error:", emailError);
                // Return 400 if email is invalid or already in use
                return NextResponse.json(
                    { error: emailError.message || 'Failed to update email in Supabase Auth.' }, 
                    { status: 400 }
                );
            }
        }

        // 3. Handle Profile Table (username, role) update
        if (Object.keys(profileUpdates).length > 0) {
            const { data: updatedProfiles, error: dbError } = await supabase
                .from('users')
                .update(profileUpdates)
                .eq('userid', user.id)
                .select() // Select the updated row to return it
                .returns<DatabaseProfile[]>();

            if (dbError) {
                console.error('API Error: Supabase PUT query failed.', dbError.message);
                return NextResponse.json({ error: 'Failed to update profile data.' }, { status: 500 });
            }

            // Successfully updated and return the new profile
            if (updatedProfiles && updatedProfiles.length > 0) {
                return NextResponse.json(mapToClientProfile(updatedProfiles[0]), { status: 200 });
            }
        }
        
        // If only the email was updated (which returns no data from the 'users' table update),
        // we need to re-fetch the profile to ensure the client has the most current state.
        const { data: newProfile, error: refetchError } = await supabase
            .from('users') 
            .select(`userid, username, email, pfpurl, isdev, accountcreationdate`) 
            .eq('userid', user.id) 
            .returns<DatabaseProfile[]>();
        
        if (refetchError || !newProfile || newProfile.length === 0) {
            console.error('API Error: Profile refetch failed after email update.', refetchError?.message);
             return NextResponse.json({ error: 'Profile updated, but failed to retrieve new profile data.' }, { status: 500 });
        }


        // Return the final, potentially updated profile (with new email status reflected)
        return NextResponse.json(mapToClientProfile(newProfile[0]), { status: 200 });


    } catch (e) {
        console.error('API Error: Unhandled exception during profile PUT.', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}