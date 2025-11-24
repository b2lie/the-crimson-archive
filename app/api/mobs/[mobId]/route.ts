import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { mobId: string } }) {
  try {
    // TODO: Connect to Flask backend to delete mob
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete mob" }, { status: 500 })
  }
}
