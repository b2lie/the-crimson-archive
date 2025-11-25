import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { characterId: string } }) {
  try {
    const supabase = await createClient()
    const characterId = Number(params.characterId)

    const { data: character, error } = await supabase
      .from("characters")
      .select("*")
      .eq("characterid", characterId)
      .single()

    if (error || !character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    return NextResponse.json(character, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch character" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { characterId: string } }) {
  try {
    const supabase = await createClient()
    const characterId = Number(params.characterId)
    const characterData = await request.json()

    const { data, error } = await supabase
      .from("characters")
      .update(characterData)
      .eq("characterid", characterId)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Failed to update character" }, { status: 400 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update character" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { characterId: string } }) {
  try {
    const supabase = await createClient()
    const characterId = Number(params.characterId)

    const { data, error } = await supabase
      .from("characters")
      .delete()
      .eq("characterid", characterId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to delete character" }, { status: 400 })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 })
  }
}