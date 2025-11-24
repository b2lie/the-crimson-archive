import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { gameId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const gameId = Number.parseInt(params.gameId)

    const [
      { data: game, error: gameError },
      { data: characters, error: charsError },
      { data: maps, error: mapsError },
      { data: mobs, error: mobsError },
      { data: arcs, error: arcsError },
      { data: contributors, error: contribError },
    ] = await Promise.all([
      supabase.schema("crimson").from("games").select("*").eq("gameid", gameId).single(),
      supabase.schema("crimson").from("games_characters").select("characterid").eq("gameid", gameId),
      supabase.schema("crimson").from("maps").select("*").eq("gameid", gameId),
      supabase.schema("crimson").from("mobs").select("*").eq("gameid", gameId),
      supabase.schema("crimson").from("storyarcs").select("*").eq("gameid", gameId),
      supabase.schema("crimson").from("games_contributors").select("contributorid, roleid").eq("gameid", gameId),
    ])

    if (gameError) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        gameID: game.gameid,
        title: game.title,
        plotSummary: game.plotsummary,
        releaseDate: game.releasedate,
        gameCoverURL: game.gamecoverurl,
        gameLogoURL: game.gamelogourl,
        multiplayerSupport: game.multiplayersupport,
        characters: characters || [],
        maps: maps || [],
        mobs: mobs || [],
        storyArcs: arcs || [],
        contributors: contributors || [],
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch game details" }, { status: 500 })
  }
}
