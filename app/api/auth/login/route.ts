import { type NextRequest, NextResponse } from "next/server"
import supabase from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    // Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // successful login
    return NextResponse.json(
      {
        username: data.user?.email?.split("@")[0] || "user",
        email: data.user?.email,
        id: data.user?.id,
      },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
