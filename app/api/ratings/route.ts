import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: ratings, error } = await supabase.from("ratings").select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ratings }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const ratingData = await request.json()

    if (!ratingData.ratingValue || !ratingData.gameId || !ratingData.userId) {
      return NextResponse.json({ error: "Rating value, game ID, and user ID are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("ratings")
      .insert([
        {
          rating: ratingData.rating,
          review: ratingData.review,
          reviewtimestamp: ratingData.reviewtimestamp,
          personalbest: ratingData.personalbest
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add rating" }, { status: 500 })
  }
}