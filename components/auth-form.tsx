"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthFormProps {
  onLoginSuccess: (userData: { email: string }) => void
}

export function AuthForm({ onLoginSuccess }: AuthFormProps) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()

      if (isSignup) {
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
            data: {
              display_name: displayName,
            },
          },
        })

        if (signupError) {
          setError(signupError.message)
          return
        }

        setError("Check your email to confirm your account")
        setEmail("")
        setPassword("")
        setDisplayName("")
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) {
          setError(loginError.message)
          return
        }

        onLoginSuccess({ email: data.user?.email || email })
        router.push("/")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary bg-card">
        <CardHeader className="border-b-2 border-primary">
          <CardTitle className="text-2xl text-primary">CRIMSON DATABASE</CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignup ? "Create a new account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Display Name</label>
                  <Input
                    type="text"
                    placeholder="Enter display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="border-primary bg-background"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-primary bg-background"
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
                className="border-primary bg-background"
              />
            </div>

            {error && <div className="p-3 bg-accent/10 border border-accent text-accent rounded">{error}</div>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary"
            >
              {loading ? "Loading..." : isSignup ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignup(!isSignup)
                setError("")
              }}
              className="mt-2 text-accent font-semibold hover:underline"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
