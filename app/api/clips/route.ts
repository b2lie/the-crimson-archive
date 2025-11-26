import { createClient, createSessionClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface PostClipBody {
    gameId: string;
    cliptitle: number;
    clipurl?: string;
    mediatype?: string;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // CRITICAL: We select the necessary joins: games(title) and users(username)
        const { data: clips, error } = await supabase
            .from("clips")
            .select("*, games(gameid, title)")
          
        if (error) {
            console.error("Supabase GET Error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ clips }, { status: 200 })
    } catch (error) {
        console.error("Unhandled GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch clips" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const supabase = await createSessionClient()

    try {
        // 1. Get the authenticated user ID (MANDATORY)
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Authentication required." }, { status: 401 });
        }

        const userId = user.id;
        const clipData: PostClipBody = await request.json()

        // 2. Validation
        if (!clipData.cliptitle || !clipData.gameId) {
            return NextResponse.json({ error: "Clip title and Game ID are required." }, { status: 400 })
        }

        const gameIdInt = parseInt(clipData.gameId.toString(), 10);

        if (isNaN(gameIdInt) || gameIdInt <= 0) {
            return NextResponse.json({ error: "Invalid Game ID provided." }, { status: 400 });
        }

        // 3. Construct the full payload
        const insertPayload = {
            gameid: gameIdInt,
            cliptitle: clipData.cliptitle,
            clipurl: clipData.clipurl || null,
            mediatype: clipData.mediatype || null,
        };

        const { data, error } = await supabase
            .from("clips")
            .insert([insertPayload])
            // CRITICAL: Select joined data on POST to return a fully populated object 
            .select("*, games(gameid, title)")
            .single()

        if (error) {
            console.error("Supabase POST Error:", error.message, error.details);
            return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error("Unhandled POST Error:", error);
        return NextResponse.json({ error: "Failed to add clip" }, { status: 500 })
    }
}