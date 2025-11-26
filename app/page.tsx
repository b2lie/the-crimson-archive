"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"

// Define the required User type
interface User {
  email: string
  username: string
  // Add the missing 'userid' property
  userid: string 
}

export default function Home() {
  // Use the new User type
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    if (!supabase) {
      setError(
        "Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
      )
      setLoading(false)
      return
    }

    const checkUser = async () => {
      try {
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser()

        if (supabaseUser) {
          setUser({
            email: supabaseUser.email || "",
            username: supabaseUser.user_metadata?.display_name || supabaseUser.email?.split("@")[0] || "User",
            // Make sure to include the userid (which is the Supabase user's ID)
            userid: supabaseUser.id, 
          })
        }
      } catch (error) {
        console.error("[v0] Error checking user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email || "",
          username: session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "User",
          // Include the userid from the session
          userid: session.user.id,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }

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
              // Assuming userData from AuthForm has an 'id' or 'userid' field
              // You might need to adjust this logic based on what AuthForm actually returns
              const userObject = userData as { email: string; id: string; username?: string };
              setUser({
                email: userObject.email,
                username: userObject.username ?? userObject.email.split("@")[0] ?? "User",
                // Assuming the user ID is returned as 'id'
                userid: userObject.id, 
              })
            }}
          />
      )}
    </main>
  )
}