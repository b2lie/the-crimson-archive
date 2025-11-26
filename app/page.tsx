"use client"

import { useEffect, useState, useCallback } from "react" // Added useCallback
import { createClient } from "@/lib/supabase/client"
import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"
import { SupabaseClient } from "@supabase/supabase-js" // Import for better typing

// Define the strict User type required by the Dashboard component
interface DashboardUser {
  email: string;
  username: string;
  userid: string;
  isdev: boolean;
}

// 🔑 NEW: Define the type for the client (for internal use)
type ClientType = SupabaseClient | null;

export default function Home() {
  // State definitions
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔑 FIX 1: Store the client instance (or a reference to it) in state/ref
  // Since createClient() is idempotent and fast, we will define it directly in the scope
  // and pass it where necessary, but we'll modify the functions to handle client creation.

  // -------------------------------------------------------------------
  // 1. checkUser is now a memoized callback that creates the client internally
  // -------------------------------------------------------------------
  const checkUser = useCallback(async () => {
    // 🔑 FIX 2: Create the client inside the function, or pass it as an argument if defined elsewhere.
    // Given the structure, recreating it is safest for external calls like onLoginSuccess.
    const supabase = createClient();

    if (!supabase) {
      // Handle the case where the client creation fails (should be caught by the useEffect error check)
      setError("Supabase not configured.");
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser()

      if (supabaseUser) {
        // --- ROLE/ISDEV LOGIC (Placeholder) ---
        const isdev = supabaseUser.user_metadata?.isdev === true;
        const username = supabaseUser.user_metadata?.display_name || supabaseUser.email?.split("@")[0] || "User";

        setUser({
          email: supabaseUser.email || "",
          username: username,
          userid: supabaseUser.id,
          isdev: isdev,
        })
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("[v0] Error checking user:", error)
      setUser(null);
    } finally {
      setLoading(false)
    }
    // No dependencies needed since it only relies on the client factory and state setters
  }, [])

  // -------------------------------------------------------------------
  // 2. handleLogout must also create the client internally
  // -------------------------------------------------------------------
  const handleLogout = async () => {
    // 🔑 FIX 3: Recreate the client inside handleLogout to ensure it's not null
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }


  // -------------------------------------------------------------------
  // 3. useEffect is simplified to handle initial checks and the listener
  // -------------------------------------------------------------------
  useEffect(() => {
    const supabase = createClient()

    if (!supabase) {
      setError(
        "Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
      )
      setLoading(false)
      return
    }

    // Call checkUser on initial mount
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // When auth state changes, re-run the full check for a clean state update
      if (session?.user) {
        // No need to pass 'supabase' since checkUser creates it internally now
        checkUser();
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
    // Add checkUser to dependencies since it's defined outside, even though it's memoized
  }, [checkUser])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <h1 className="text-red-500 font-bold mb-2">Configuration Error</h1>
          <p className="text-white text-sm">{error}</p>
          <p className="text-muted-foreground text-xs mt-4">
            Check your Vercel project's environment variables in the "Vars" section of the Connect sidebar.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthForm
          onLoginSuccess={(userData) => {
            // 🔑 FIX 4: Call checkUser directly after successful auth to pull full user profile
            checkUser();
          }}
        />
      )}
    </main>
  )
}