import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: clips, error } = await supabase.from("clips").select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ clips }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clips" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const clipData = await request.json()

    if (!clipData.cliptitle) {
      return NextResponse.json({ error: "Clip title required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("clips")
      .insert([
        {
          cliptitle: clipData.cliptitle,
          clipurl: clipData.clipurl,
          mediatype: clipData.mediatype,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add clip" }, { status: 500 })
  }
}
