import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: maps, error } = await supabase.from("maps").select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ maps }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch maps" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const mapData = await request.json()

    if (!mapData.mapName) {
      return NextResponse.json({ error: "Map name required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("maps")
      .insert([
        {
          mapname: mapData.mapName,
          floorname: mapData.floorName,
          description: mapData.description,
          mapurl: mapData.mapURL,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add map" }, { status: 500 })
  }
}