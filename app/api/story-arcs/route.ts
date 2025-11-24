import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const arcData = await request.json()

    // TODO: Connect to Flask backend to save story arc
    if (!arcData.arcTitle || !arcData.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    return NextResponse.json({ storyArcID: Date.now(), ...arcData }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add story arc" }, { status: 500 })
  }
}
