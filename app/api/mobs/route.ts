import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: mobs, error } = await supabase.from("mobs").select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ mobs }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch mobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const mobData = await request.json()

    if (!mobData.mobName) {
      return NextResponse.json({ error: "Mob name required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("mobs")
      .insert([
        {
          mobname: mobData.mobName,
          mobtype: mobData.mobType,
          description: mobData.description,
          weakness: mobData.weakness,
          mobspriteurl: mobData.mobspriteurl,
          spawnnotes: mobData.spawnnotes,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add mob" }, { status: 500 })
  }
}