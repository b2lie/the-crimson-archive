import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { gameId?: string } } // make optional
) {
  const gameIdStr = params.gameId;
  const gameId = Number(gameIdStr);

  console.log("Fetching game with ID:", gameId);
  console.log("Raw gameId parameter:", gameIdStr);

  if (!gameIdStr || isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("games")
    .select(`
      *,
      characters(*),
      maps(*),
      mobs(*),
      storyArcs(*),
      contributors(*)
    `)
    .eq("gameid", gameId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Game not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}