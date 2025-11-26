import { createClient, createSessionClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Define the expected structure of the incoming rating data from the client
interface PostRatingBody {
    gameId: string;
    rating: number;
    review?: string;
    personalbest?: string;
}

/**
 * GET Handler: Fetches all ratings with joined data (returns lowercase keys as frontend expects).
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // CRITICAL: We select the necessary joins: games(title) and users(username)
        const { data: ratings, error } = await supabase
            .from("ratings")
            .select("*, games(gameid, title), users(userid, username)")
            .order("reviewtimestamp", { ascending: false });

        if (error) {
            console.error("Supabase GET Error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // FIX: No mapping needed! The frontend expects the lowercase 'games' and 'users' returned by Supabase.
        return NextResponse.json({ ratings }, { status: 200 })
    } catch (error) {
        console.error("Unhandled GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 })
    }
}

/**
 * POST Handler: Inserts a new rating, requiring authentication.
 */
export async function POST(request: NextRequest) {
    const supabase = await createSessionClient()

    try {
        // 1. Get the authenticated user ID (MANDATORY)
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Authentication required." }, { status: 401 });
        }

        const userId = user.id;
        const ratingData: PostRatingBody = await request.json()

        // 2. Validation
        if (!ratingData.rating || !ratingData.gameId) {
            return NextResponse.json({ error: "Rating score (1-5) and Game ID are required." }, { status: 400 })
        }

        const gameIdInt = parseInt(ratingData.gameId.toString(), 10);

        if (isNaN(gameIdInt) || gameIdInt <= 0) {
            return NextResponse.json({ error: "Invalid Game ID provided." }, { status: 400 });
        }

        // 3. Construct the full payload
        const insertPayload = {
            userid: userId,
            gameid: gameIdInt,
            rating: ratingData.rating,
            review: ratingData.review || null,
            personalbest: ratingData.personalbest || null,
            reviewtimestamp: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("ratings")
            .insert([insertPayload])
            // CRITICAL: Select joined data on POST to return a fully populated object 
            .select("*, games(gameid, title), users(userid, username)")
            .single()

        if (error) {
            console.error("Supabase POST Error:", error.message, error.details);
            if (error.code === '23505') {
                return NextResponse.json({ error: "You have already reviewed this game." }, { status: 409 });
            }
            return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 })
        }

        // FIX: No mapping needed here either! Return the raw Supabase output.
        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error("Unhandled POST Error:", error);
        return NextResponse.json({ error: "Failed to add rating" }, { status: 500 })
    }
}