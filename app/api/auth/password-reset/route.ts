import { type NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/supabase/server'; 

export async function POST(request: NextRequest) {
    const supabase = await createSessionClient();
    
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required for password reset.' }, { status: 400 });
        }

        // Use the resetPasswordForEmail method
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // Optional: Specify the URL the user is redirected to after clicking the reset link
            // redirectTo: 'http://localhost:3000/update-password',
        });

        if (error) {
            console.error("Supabase Password Reset Error:", error.message);
            // NOTE: For security, Supabase often returns a generic message even if the user doesn't exist.
            // We'll return a success message regardless of the error, as recommended practice.
            // return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Always return a success status to prevent user enumeration
        return NextResponse.json(
            { message: 'If an account with that email exists, a password reset link has been sent.' }, 
            { status: 200 }
        );

    } catch (e) {
        console.error('API Error: Unhandled exception during password reset POST.', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}