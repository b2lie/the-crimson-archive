# Supabase Integration Guide

## Overview
This document explains all the changes made to connect your gaming database frontend to Supabase.

## Files Added/Created

### 1. **lib/supabase/client.ts**
- Creates a browser-side Supabase client
- Use this in **Client Components** (components with `"use client"`)
- Use it for authentication actions: `signUp()`, `signInWithPassword()`, `signOut()`

\`\`\`typescript
import { createClient } from "@/lib/supabase/client"

// In a client component:
const supabase = createClient()
const { data, error } = await supabase.auth.signUp({ email, password })
\`\`\`

### 2. **lib/supabase/server.ts**
- Creates a server-side Supabase client
- Use this in **API Routes** and **Server Components**
- Used for database queries with RLS protection

\`\`\`typescript
import { createClient } from "@/lib/supabase/server"

// In an API route:
const supabase = await createClient()
const { data, error } = await supabase.from("Games").select("*")
\`\`\`

### 3. **lib/supabase/middleware.ts**
- Handles session refresh on every request
- Automatically redirects unauthenticated users to `/auth/login`
- CRITICAL: Do not modify code between `createServerClient()` and `getUser()`

### 4. **middleware.ts** (Root level)
- Exports the middleware configuration
- Runs on all routes except static files and images
- Refreshes user sessions automatically

## Files Modified

### 1. **app/api/auth/signup/route.ts**
**What changed:**
- **OLD:** Placeholder that just echoed back the input
- **NEW:** Uses `supabase.auth.signUp()` to create a real user account

**What to replace:**
\`\`\`typescript
// REPLACE THIS:
// TODO: Integrate with Flask backend or Supabase auth

// WITH THIS:
const supabase = await createClient()
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
    data: { display_name: displayName }
  }
})
\`\`\`

### 2. **app/api/auth/login/route.ts**
**What changed:**
- **OLD:** Placeholder that just echoed back the input
- **NEW:** Uses `supabase.auth.signInWithPassword()` to authenticate

**What to replace:**
\`\`\`typescript
// REPLACE THIS:
// TODO: Integrate with Flask backend or Supabase auth

// WITH THIS:
const supabase = await createClient()
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
\`\`\`

### 3. **components/auth-form.tsx**
**What changed:**
- **OLD:** Called `/api/auth/signup` and `/api/auth/login` endpoints
- **NEW:** Uses Supabase client directly to authenticate

**What to replace:**
\`\`\`typescript
// REPLACE THIS:
const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login"
const response = await fetch(endpoint, { method: "POST", body: JSON.stringify(payload) })

// WITH THIS:
const supabase = createClient()
if (isSignup) {
  const { error } = await supabase.auth.signUp({ email, password, ... })
} else {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
}
\`\`\`

### 4. **app/api/games/route.ts**
**What changed:**
- **OLD:** Returns placeholder game data
- **NEW:** Fetches real games from the `Games` table in Supabase

**What to replace:**
\`\`\`typescript
// REPLACE THIS:
const games = [{ gameID: 1, title: "Example Game", ... }]

// WITH THIS:
const supabase = await createClient()
const { data: games, error } = await supabase
  .from("Games")
  .select("*")
  .order("releaseDate", { ascending: false })
\`\`\`

**POST changes:**
\`\`\`typescript
// REPLACE THIS:
return NextResponse.json({ gameID: Date.now(), ...gameData }, { status: 201 })

// WITH THIS:
const { data, error } = await supabase
  .from("Games")
  .insert([{ ...gameData, createdBy: user.id }])
  .select()
\`\`\`

### 5. **app/api/characters/route.ts** (Same pattern)
**What changed:**
- **OLD:** Returns empty array
- **NEW:** Fetches from `InGameCharacters` table

\`\`\`typescript
// GET: Fetch from Supabase
const { data: characters, error } = await supabase
  .from("InGameCharacters")
  .select("*")

// POST: Insert into Supabase
const { data, error } = await supabase
  .from("InGameCharacters")
  .insert([{ ...characterData, createdBy: user.id }])
  .select()
\`\`\`

## Template for Other API Routes

For **Maps**, **Mobs**, **StoryArcs**, etc., follow this pattern:

\`\`\`typescript
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Always check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch from your table
    const { data, error } = await supabase
      .from("YourTableName")  // Replace with: Maps, Mobs, StoryArcs, etc.
      .select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const inputData = await request.json()

    const { data, error } = await supabase
      .from("YourTableName")  // Replace with your table name
      .insert([{ ...inputData, createdBy: user.id }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add record" }, { status: 500 })
  }
}
\`\`\`

## Environment Variables (Already Set)

You have access to:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - For admin operations (if needed)
- `POSTGRES_URL` - Direct database connection (optional)

These are automatically configured in your Vercel environment.

## Key Concepts

### Authentication Flow
1. User signs up/logs in via `AuthForm`
2. Form uses `supabase.auth.signUp()` or `signInWithPassword()`
3. Middleware automatically refreshes session on every request
4. Protected routes redirect to login if no session exists

### Database Operations
1. All API routes use `createClient()` from server
2. Check user authentication with `supabase.auth.getUser()`
3. Execute queries on your tables: `supabase.from("TableName").select()`
4. Always include `createdBy: user.id` when inserting user-created data

### Row Level Security (RLS)
- Supabase protects tables with RLS policies
- Only authenticated users can perform CRUD operations
- Always pass the user ID when creating/updating records
- This is done automatically in the routes above

## Testing

### Test Sign Up
1. Go to your app homepage
2. Click "Sign Up"
3. Enter email and password
4. Check your email for confirmation link
5. Click link to confirm

### Test Sign In
1. Confirm email first (from signup)
2. Go to homepage
3. Click "Sign In"
4. Enter credentials
5. Should redirect to `/dashboard`

### Test Database Queries
1. Sign in
2. Navigate to Games/Characters pages
3. Click "Add Game" or "Add Character"
4. Fill in the form and submit
5. Check the table for your new record

## Common Issues

### Issue: "Unauthorized" error on database queries
**Solution:** Make sure the user is authenticated (middleware redirects to login if not)

### Issue: Email confirmation not working
**Solution:** Check `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` environment variable is set

### Issue: Can't insert data into tables
**Solution:** Make sure RLS policies allow authenticated users to insert. Check Supabase dashboard.

### Issue: Session expires randomly
**Solution:** Middleware refresh is automatic. Make sure middleware.ts is in root app directory.

## Next Steps

1. **Create remaining API routes** for Maps, Mobs, StoryArcs using the template above
2. **Update components** like `games-gallery`, `character-browser` to call your API routes
3. **Add database tables** in Supabase (Users, Platforms, Games, InGameCharacters, Maps, Mobs, StoryArcs, Roles, Contributors, Clips, Ratings, GamesPlatforms, GamesCharacters, Appearances, MobMaps, GamesContributors)
4. **Setup RLS policies** on each table to protect data
5. **Test thoroughly** before going to production
`
