import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const mapData = await request.json()

    // TODO: Connect to Flask backend to save map
    if (!mapData.mapName || !mapData.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    return NextResponse.json({ mapID: Date.now(), ...mapData }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add map" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Connect to Flask backend to fetch maps
    const maps = []
    return NextResponse.json({ maps }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch maps" }, { status: 500 })
  }
}
