import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Server-side queries use service role key which has full permissions
    console.log("[v0] About to fetch games from database")
    const { data: games, error } = await supabase.from("games").select("*").order("releasedate", { ascending: false })

    console.log("[v0] Supabase response - Data:", games)
    console.log("[v0] Supabase response - Error:", error)

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ games }, { status: 200 })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const gameData = await request.json()

    if (!gameData.title || !gameData.releaseDate) {
      return NextResponse.json({ error: "Title and release date required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("games")
      .insert([
        {
          title: gameData.title,
          releasedate: gameData.releaseDate,
          plotsummary: gameData.plotSummary,
          gamecoverurl: gameData.gameCoverURL,
          gamelogourl: gameData.gameLogoURL,
          multiplayersupport: gameData.multiplayerSupport || false,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add game" }, { status: 500 })
  }
}
