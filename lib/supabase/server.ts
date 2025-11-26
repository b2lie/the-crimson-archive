import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// -----------------------------------------------------------
// 1. PRIMARY/DEFAULT CLIENT (Safe, Non-Cookie/Non-Session)
// Use this for almost all API calls, especially for CRUD operations 
// on non-user data (e.g., fetching Games, Characters, Maps).
// This is your standard, non-crashing client.
// -----------------------------------------------------------

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) {
      throw new Error("Missing Supabase URL and keys")
    }
    // Note: This falls back to the Anon Key client, which is safe.
    return createSupabaseClient(supabaseUrl, anonKey)
  }
  // This is the powerful Service Role Client
  return createSupabaseClient(supabaseUrl, supabaseServiceKey)
}

// -----------------------------------------------------------
// 2. SESSION CLIENT (Cookie-Aware)
// Use this ONLY for API calls where you MUST check the user's session 
// (e.g., /api/account, /api/auth/logout, or protected server actions).
// -----------------------------------------------------------

export const createSessionClient = async () => { // ⬅️ RENAMED for clarity
    const cookieStore = await cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !anonKey) {
        throw new Error("Missing Supabase URL or Anon Key for cookie client.")
    }

    return createServerClient(
        supabaseUrl,
        anonKey,
        {
            cookies: {
                get: (name: string) => cookieStore.get(name)?.value,
                set: (name: string, value: string, options: any) => {
                    cookieStore.set(name, value, options)
                },
                remove: (name: string, options: any) => {
                    cookieStore.delete(name) 
                },
            } as any, 
        }
    )
}