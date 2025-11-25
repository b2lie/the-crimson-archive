import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { mobId: string } }) {
  try {
    const supabase = await createClient()
    const mobId = Number(params.mobId)

    const { data: mob, error } = await supabase
      .from("mobs")
      .select("*")
      .eq("mobid", mobId)
      .single()

    if (error || !mob) {
      return NextResponse.json({ error: "Mob not found" }, { status: 404 })
    }

    return NextResponse.json(mob, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch mob" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { mobId: string } }) {
  try {
    const supabase = await createClient()
    const mobId = Number(params.mobId)
    const mobData = await request.json()
    const { data, error } = await supabase
      .from("mobs")
      .update(mobData)
      .eq("mobid", mobId)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Failed to update mob" }, { status: 400 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update mob" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { mobId: string } }) {
  try {
    const supabase = await createClient()
    const mobId = Number(params.mobId)

    const { data, error } = await supabase
      .from("mobs")
      .delete()
      .eq("mobid", mobId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to delete mob" }, { status: 400 })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete mob" }, { status: 500 })
  }
}