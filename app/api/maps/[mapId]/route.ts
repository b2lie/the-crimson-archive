import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { mapId: string } }) {
  try {
    const supabase = await createClient()
    const mapId = Number(params.mapId)

    const { data: map, error } = await supabase
      .from("maps")
      .select("*")
      .eq("mapid", mapId)
      .single()

    if (error || !map) {
      return NextResponse.json({ error: "Map not found" }, { status: 404 })
    }

    return NextResponse.json(map, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch map" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { mapId: string } }) {
  try {
    const supabase = await createClient()
    const mapId = Number(params.mapId)
    const mapData = await request.json()
    const { data, error } = await supabase
      .from("maps")
      .update(mapData)
      .eq("mapid", mapId)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Failed to update map" }, { status: 400 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update map" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { mapId: string } }) {
  try {
    const supabase = await createClient()
    const mapId = Number(params.mapId)

    const { data, error } = await supabase
      .from("maps")
      .delete()
      .eq("mapid", mapId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to delete map" }, { status: 400 })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete map" }, { status: 500 })
  }
}