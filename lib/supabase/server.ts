import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("[v0] Missing Supabase environment variables: SERVICE_ROLE_KEY not found")
    // Fallback: return a client with anon key for development (will have limited permissions)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) {
      throw new Error("Missing Supabase URL and keys")
    }
    return createSupabaseClient(supabaseUrl, anonKey)
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey)
}
