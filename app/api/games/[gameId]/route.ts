import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { gameId: string } }) {
  const supabase = await createClient();
  const gameId = Number(params.gameId);

  // fetch main game
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("gameid", gameId)
    .single();

  if (gameError || !game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // fetch related data
  const [{ data: characters }, { data: maps }, { data: mobs }, { data: storyArcs }, { data: contributors }] =
    await Promise.all([
      supabase.from("characters").select("*").eq("gameid", gameId),
      supabase.from("maps").select("*").eq("gameid", gameId),
      supabase.from("mobs").select("*").eq("gameid", gameId),
      supabase.from("storyarcs").select("*").eq("gameid", gameId),
      supabase.from("contributors").select("*").eq("gameid", gameId),
    ]);

  return NextResponse.json({
    ...game,
    characters: characters || [],
    maps: maps || [],
    mobs: mobs || [],
    storyArcs: storyArcs || [],
    contributors: contributors || [],
  });
}
