"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"
import { SupabaseClient } from "@supabase/supabase-js"

// Define the strict User type required by the Dashboard component
interface DashboardUser {
  email: string;
  username: string;
  userid: string;
  isdev: boolean;
}

// Type alias for Supabase client
type ClientType = SupabaseClient | null;

export default function Home() {
  // State definitions
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -------------------------------------------------------------------
  // 1. checkUser FUNCTION DEFINITION (Accessible outside useEffect)
  // -------------------------------------------------------------------
  // This function is the core logic for fetching the user and setting the state.
  const checkUser = useCallback(async () => {
    // Create the client inside the function to avoid scope/null issues.
    const supabase = createClient();

    if (!supabase) {
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
        // --- ROLE/ISDEV LOGIC ---
        // Assumes 'isdev' is a boolean flag in the user's metadata/profile
        const isdev = supabaseUser.user_metadata?.isdev === true;
        const username = supabaseUser.user_metadata?.display_name || supabaseUser.email?.split("@")[0] || "User";

        setUser({
          email: supabaseUser.email || "",
          username: username,
          userid: supabaseUser.id, // Assign the Supabase user ID
          isdev: isdev, // Assign the role status
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
  }, []) // Dependencies array is empty, as it only relies on the client factory

  // -------------------------------------------------------------------
  // 2. handleLogout
  // -------------------------------------------------------------------
  const handleLogout = async () => {
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }


  // -------------------------------------------------------------------
  // 3. useEffect (Initialization and Listener)
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

    // 🔑 CALL 1: Initial check on component mount
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // 🔑 CALL 2: Check user whenever auth state changes
        checkUser();
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
    // checkUser is a dependency because it's defined outside useEffect
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
            // 🔑 CALL 3: Check user immediately after successful login/sign-up
            checkUser();
          }}
        />
      )}
    </main>
  )
}