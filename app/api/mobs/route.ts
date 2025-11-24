import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const mobData = await request.json()

    // TODO: Connect to Flask backend to save mob
    if (!mobData.mobName) {
      return NextResponse.json({ error: "Missing mob name" }, { status: 400 })
    }

    return NextResponse.json({ mobID: Date.now(), ...mobData }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add mob" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Connect to Flask backend to fetch mobs
    const mobs = []
    return NextResponse.json({ mobs }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch mobs" }, { status: 500 })
  }
}
