import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // TODO: Connect to Flask backend to fetch characters
    const characters = []
    return NextResponse.json({ characters }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const characterData = await request.json()

    // TODO: Connect to Flask backend to save character
    if (!characterData.characterName) {
      return NextResponse.json({ error: "Missing character name" }, { status: 400 })
    }

    return NextResponse.json({ characterID: Date.now(), ...characterData }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add character" }, { status: 500 })
  }
}
