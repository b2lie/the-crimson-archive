import { createClient, createSessionClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// --- GET Handler (Public Read) ---
export async function GET(request: NextRequest, { params }: { params: { mapId: string | Promise<string> } }) {
  try {
    // FIX: Await params to ensure the dynamic segment value is resolved
    const resolvedParams = await params;
    const mapIdStr = resolvedParams.mapId;
    const mapId = Number(mapIdStr);

    if (!mapIdStr || isNaN(mapId)) {
      return NextResponse.json({ error: "Invalid map ID format in URL." }, { status: 400 });
    }
    
    // Use the unauthenticated client for public read
    const supabase = await createClient() 

    const { data: map, error } = await supabase
      .from("maps")
      .select("*")
      .eq("mapid", mapId)
      .single()

    if (error || !map) {
      console.error("GET Map Error:", error?.message || 'Map not found.');
      return NextResponse.json({ error: "Map not found" }, { status: 404 })
    }

    return NextResponse.json(map, { status: 200 })
  } catch (err) {
    console.error("GET Map Exception:", err);
    return NextResponse.json({ error: "Failed to fetch map" }, { status: 500 })
  }
}

// --- PUT Handler (Authenticated Update) ---
export async function PUT(request: NextRequest, { params }: { params: { mapId: string | Promise<string> } }) {
  // Use session client for authenticated write operation
  const supabase = await createSessionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
  }
  
  try {
    // FIX: Await params to ensure the dynamic segment value is resolved
    const resolvedParams = await params;
    const mapIdStr = resolvedParams.mapId;
    const mapId = Number(mapIdStr);

    if (!mapIdStr || isNaN(mapId)) {
      return NextResponse.json({ error: "Invalid map ID format in URL." }, { status: 400 });
    }

    const mapData = await request.json()
    const { data, error } = await supabase
      .from("maps")
      .update(mapData)
      .eq("mapid", mapId)
      .select()
      .single()

    if (error || !data) {
      console.error("PUT Map DB Error:", error?.message);
      return NextResponse.json({ error: `Failed to update map: ${error?.message || 'Data not found.'}` }, { status: 400 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error("PUT Map Exception:", err);
    return NextResponse.json({ error: "Failed to update map" }, { status: 500 })
  }
}

// --- DELETE Handler (Authenticated Delete) ---
/**
 * FIX: Removed .single() from the DELETE query.
 * This prevents the "Cannot coerce the result to a single JSON object" error
 * if the map record is not found (and 0 rows are deleted).
 */
export async function DELETE(request: NextRequest, { params }: { params: { mapId: string | Promise<string> } }) {
  // Use session client for authenticated write operation
  const supabase = await createSessionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
  }

  try {
    // FIX: Await params to ensure the dynamic segment value is resolved
    const resolvedParams = await params;
    const mapIdStr = resolvedParams.mapId;
    const mapId = Number(mapIdStr);

    if (!mapIdStr || isNaN(mapId)) {
      return NextResponse.json({ error: "Invalid map ID format in URL." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("maps")
      .delete()
      .eq("mapid", mapId)
      .select()
      // .single() <--- REMOVED THIS TO PREVENT COERCION ERROR WHEN NO RECORD IS FOUND

    if (error) {
      console.error("DELETE Map DB Error:", error.message);
      return NextResponse.json({ error: `Failed to delete map: ${error.message}` }, { status: 400 })
    }
    
    // data will be an array of deleted rows (0 or 1 in this case).
    const deletedCount = data ? data.length : 0;
    const message = deletedCount > 0 
        ? `Successfully deleted map ID ${mapId}.` 
        : `Map ID ${mapId} not found, nothing deleted.`;

    return NextResponse.json({ success: true, message, deleted: data }, { status: 200 })
  } catch (err) {
    console.error("DELETE Map Exception:", err);
    return NextResponse.json({ error: "Failed to delete map" }, { status: 500 })
  }
}