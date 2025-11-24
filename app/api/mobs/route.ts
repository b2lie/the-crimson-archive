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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: mobs, error } = await supabase.schema("crimson").from("mobs").select("*")

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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mobData = await request.json()

    if (!mobData.mobname || !mobData.gameid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .schema("crimson")
      .from("mobs")
      .insert([
        {
          mobname: mobData.mobname,
          mobtype: mobData.mobtype,
          description: mobData.description,
          weakness: mobData.weakness,
          spawnnotes: mobData.spawnnotes,
          mobspriteurl: mobData.mobspriteurl,
          gameid: mobData.gameid,
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
