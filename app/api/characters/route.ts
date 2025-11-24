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

    const { data: characters, error } = await supabase.schema("crimson").from("ingamecharacters").select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ characters }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 })
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

    const characterData = await request.json()

    if (!characterData.characterName) {
      return NextResponse.json({ error: "Character name required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .schema("crimson")
      .from("ingamecharacters")
      .insert([
        {
          charactername: characterData.characterName,
          backstory: characterData.backstory,
          description: characterData.description,
          englishva: characterData.englishVA,
          japaneseva: characterData.japaneseVA,
          motioncapture: characterData.motionCapture,
          spriteurl: characterData.spriteURL,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add character" }, { status: 500 })
  }
}
