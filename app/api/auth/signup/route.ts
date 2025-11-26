import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server" 
import { createClient as createAdminClient } from '@supabase/supabase-js'

// --- Environment Variables Check Setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// This is the unified server-side route for handling user registration.
export async function POST(request: NextRequest) {
    try {
        
        // Configuration Check
        if (!supabaseUrl || !supabaseServiceRoleKey) {
            console.error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
            return NextResponse.json({ error: "Configuration Error: Missing required Supabase API keys on server." }, { status: 500 });
        }

        const { email, password, username, isDev } = await request.json()

        if (!email || !password || !username) {
            return NextResponse.json({ error: "Email, password, and username are required." }, { status: 400 })
        }

        // 1. Standard Client for Auth
        const supabase = await createClient()

        // 1. SUPABASE AUTH SIGN UP (Creates user in auth.users)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
            },
        })

        if (authError) {
            console.error("Supabase Auth Error:", authError.message);
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }
        
        const user = authData.user;
        if (!user) {
            return NextResponse.json({ error: "Authentication succeeded, but user object is missing." }, { status: 500 })
        }

        // 2. PROFILE INSERTION (Synchronizes data to your custom 'users' table)
        
        // Use the Admin Client to bypass RLS
        const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            }
        });
        
        const { error: profileError } = await adminSupabase
            .from('users') 
            .insert([
                { 
                    userid: user.id, 
                    username: username, 
                    email: email, 
                    isdev: isDev ?? false,
                    pfpurl: '/default-pfp.png', 
                },
            ])

        if (profileError) {
            console.error("Supabase Profile Insertion Failed (DB Error):", profileError.message);
            
            return NextResponse.json({ 
                error: `Account created, but profile synchronization failed. Database Error: ${profileError.message}`
            }, { status: 500 })
        }

        // 3. SUCCESS
        return NextResponse.json(
            {
                message: "Success! Check your email for verification. Profile synchronized.",
                user: { id: user.id, email: user.email, username: username },
            },
            { status: 201 },
        )
    } catch (error) {
        // This catch handles any unhandled system or dependency errors.
        console.error("FATAL Internal Server Error in Sign-up API:", error);
        return NextResponse.json({ error: "A fatal error occurred on the server. Please check terminal logs." }, { status: 500 })
    }
}