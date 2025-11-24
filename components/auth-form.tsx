"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthFormProps {
  onLoginSuccess: (userData: { username: string; email: string }) => void
}

export function AuthForm({ onLoginSuccess }: AuthFormProps) {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isDev, setIsDev] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login"
      const payload = isSignup ? { username, email, password, displayName, isDev } : { email, password }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Authentication failed")
        return
      }

      onLoginSuccess({ username: data.username || email, email: data.email })
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
                  <label className="block text-sm font-medium mb-2 text-foreground">Username</label>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={isSignup}
                    className="border-primary bg-background"
                  />
                </div>
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

            {isSignup && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDev"
                  checked={isDev}
                  onChange={(e) => setIsDev(e.target.checked)}
                  className="rounded border-primary"
                />
                <label htmlFor="isDev" className="text-sm text-foreground">
                  I'm a developer/contributor
                </label>
              </div>
            )}

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
