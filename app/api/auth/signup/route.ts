import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, displayName, isDev } = await request.json()

    // TODO: Integrate with Flask backend or Supabase auth
    // This is a placeholder - replace with actual auth logic
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Placeholder response
    return NextResponse.json(
      {
        username,
        email,
        displayName: displayName || username,
        isDev,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
