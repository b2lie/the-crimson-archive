import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

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

    const arcData = await request.json()

    if (!arcData.arctitle || !arcData.gameid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("storyarcs")
      .insert([
        {
          arctitle: arcData.arctitle,
          description: arcData.description,
          summary: arcData.summary,
          ismainarc: arcData.ismainarc || false,
          arcorder: arcData.arcorder,
          gameid: arcData.gameid,
          parentarcid: arcData.parentarcid || null,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add story arc" }, { status: 500 })
  }
}

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

    const { data: arcs, error } = await supabase.from("storyarcs").select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ arcs }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch story arcs" }, { status: 500 })
  }
}
