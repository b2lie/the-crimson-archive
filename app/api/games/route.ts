import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log("[v0] Auth error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Fetching games from crimson schema...")
    const { data: games, error } = await supabase
      .schema("crimson")
      .from("games")
      .select("*")
      .order("releasedate", { ascending: false })

    console.log("[v0] Games query error:", error)
    console.log("[v0] Games data:", games)

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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const gameData = await request.json()

    if (!gameData.title || !gameData.releaseDate) {
      return NextResponse.json({ error: "Title and release date required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .schema("crimson")
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
