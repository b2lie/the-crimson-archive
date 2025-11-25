import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { gameId: string } }) {
  try {
    const supabase = await createClient()
    const gameId = Number(params.gameId)

    const { data: game, error } = await supabase
      .from("games")
      .select("*")
      .eq("gameid", gameId)
      .single()

    if (error || !game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    return NextResponse.json(game, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { gameId: string } }) {
  try {
    const supabase = await createClient()
    const gameId = Number(params.gameId)
    const gameData = await request.json()
    const { data, error } = await supabase
      .from("games")
      .update(gameData)
      .eq("gameid", gameId)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Failed to update game" }, { status: 400 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update game" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { gameId: string } }) {
  try {
    const supabase = await createClient()
    const gameId = Number(params.gameId)

    const { data, error } = await supabase
      .from("games")
      .delete()
      .eq("gameid", gameId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to delete game" }, { status: 400 })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 })
  }
}