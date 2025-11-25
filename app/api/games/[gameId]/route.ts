import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const supabase = await createClient()
    const gameId = Number(params.gameId)

    // fetch all related data in parallel
    const [
      { data: game, error: gameError },
      { data: charactersRaw, error: charsError },
      { data: maps, error: mapsError },
      { data: mobs, error: mobsError },
      { data: arcs, error: arcsError },
      { data: contributorsRaw, error: contribError },
    ] = await Promise.all([
      supabase.from("games").select("*").eq("gameid", gameId).single(),
      supabase
        .from("games_characters")
        .select(`
          characterid,
          characters (
            characterName,
            backstory
          )
        `)
        .eq("gameid", gameId),
      supabase.from("maps").select("*").eq("gameid", gameId),
      supabase.from("mobs").select("*").eq("gameid", gameId),
      supabase.from("storyarcs").select("*").eq("gameid", gameId),
      supabase
        .from("games_contributors")
        .select(`
          contributorid,
          roleid,
          contributors (
            contributorName,
            specialization,
            roleName
          )
        `)
        .eq("gameid", gameId),
    ])

    if (gameError) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // map characters to proper format
    const characters = (charactersRaw || []).map((c: any) => ({
      characterID: c.characterid,
      characterName: c.characters.characterName,
      backstory: c.characters.backstory,
    }))

    // map contributors
    const contributors = (contributorsRaw || []).map((c: any) => ({
      contributorID: c.contributorid,
      contributorName: c.contributors.contributorName,
      specialization: c.contributors.specialization,
      roleName: c.contributors.roleName,
      roleID: c.roleid,
    }))

    return NextResponse.json(
      {
        gameID: game.gameid,
        title: game.title,
        plotSummary: game.plotsummary,
        releaseDate: game.releasedate,
        gameCoverURL: game.gamecoverurl,
        gameLogoURL: game.gamelogourl,
        multiplayerSupport: game.multiplayersupport,
        characters,
        maps: maps || [],
        mobs: mobs || [],
        storyArcs: arcs || [],
        contributors,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch game details" },
      { status: 500 }
    )
  }
}