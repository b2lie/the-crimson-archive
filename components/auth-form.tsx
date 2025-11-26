"use client"

import type React from "react"
import { useState } from "react"
// ✅ Re-introducing client-side imports for sign-in functionality
import { useRouter } from "next/navigation" 
import { createClient } from "@/lib/supabase/client" 

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthFormProps {
  onLoginSuccess: (userData: { email: string }) => void
}

export function AuthForm({ onLoginSuccess }: AuthFormProps) {
  const router = useRouter(); // Initialize router
  const supabase = createClient(); // Initialize client-side Supabase client

  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // isDev is defaulted to false for simplicity in this form
  const isDev = false; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isSignup) {
        // --- UNIFIED SERVER-SIDE SIGNUP FLOW ---
        
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            isDev,
          }),
        })
        
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Sign up failed due to generic server error.")
          return
        }

        setError(result.message) 

      } else {
        if (!supabase) {
          setError("Authentication client not initialized.")
          return
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          // Supabase errors are detailed (e.g., Invalid login credentials)
          setError(signInError.message)
          return
        }
        
        // Successful sign-in: Refresh the page to update the session state
        router.refresh()
      }
    } catch (err) {
      // This catches network errors or unexpected code issues
      setError("A network error or unexpected client error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary bg-card rounded-xl shadow-2xl">
        <CardHeader className="border-b-2 border-primary">
          <CardTitle className="text-3xl font-extrabold text-primary tracking-wider">CRIMSON</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-1">
            {isSignup ? "Create your new account" : "Sign in to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Username</label>
                <Input
                  type="text"
                  placeholder="Enter unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-primary focus:border-primary-500 bg-background"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-primary focus:border-primary-500 bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-primary focus:border-primary-500 bg-background"
              />
            </div>

            {error && <div className="p-3 bg-red-900/10 border border-red-500 text-red-400 rounded-lg font-mono text-sm overflow-x-auto">{error}</div>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary transition-all duration-300"
            >
              {loading ? "Processing..." : isSignup ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignup(!isSignup)
                setError("")
                setUsername("")
                setPassword("")
              }}
              className="mt-2 text-primary font-semibold hover:underline"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}