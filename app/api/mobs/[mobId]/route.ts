import { createClient, createSessionClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// --- GET Handler (Public Read) ---
export async function GET(request: NextRequest, { params }: { params: { mobId: string | Promise<string> } }) {
  try {
    // FIX: Await params to ensure the dynamic segment value is resolved
    const resolvedParams = await params;
    const mobIdStr = resolvedParams.mobId;
    const mobId = Number(mobIdStr);

    if (!mobIdStr || isNaN(mobId)) {
      return NextResponse.json({ error: "Invalid mob ID format in URL." }, { status: 400 });
    }
    
    // Use the unauthenticated client for public read
    const supabase = await createClient() 

    const { data: mob, error } = await supabase
      .from("mobs")
      .select("*")
      .eq("mobid", mobId)
      .single()

    if (error || !mob) {
      console.error("GET Mob Error:", error?.message || 'Mob not found.');
      return NextResponse.json({ error: "Mob not found" }, { status: 404 })
    }

    return NextResponse.json(mob, { status: 200 })
  } catch (err) {
    console.error("GET Mob Exception:", err);
    return NextResponse.json({ error: "Failed to fetch mob" }, { status: 500 })
  }
}

// --- PUT Handler (Authenticated Update) ---
export async function PUT(request: NextRequest, { params }: { params: { mobId: string | Promise<string> } }) {
  // Use session client for authenticated write operation
  const supabase = await createSessionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
  }
  
  try {
    // FIX: Await params to ensure the dynamic segment value is resolved
    const resolvedParams = await params;
    const mobIdStr = resolvedParams.mobId;
    const mobId = Number(mobIdStr);

    if (!mobIdStr || isNaN(mobId)) {
      return NextResponse.json({ error: "Invalid mob ID format in URL." }, { status: 400 });
    }

    const mobData = await request.json()
    const { data, error } = await supabase
      .from("mobs")
      .update(mobData)
      .eq("mobid", mobId)
      .select()
      .single()

    if (error || !data) {
      console.error("PUT Mob DB Error:", error?.message);
      return NextResponse.json({ error: `Failed to update mob: ${error?.message || 'Data not found.'}` }, { status: 400 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error("PUT Mob Exception:", err);
    return NextResponse.json({ error: "Failed to update mob" }, { status: 500 })
  }
}

// --- DELETE Handler (Authenticated Delete) ---
export async function DELETE(request: NextRequest, { params }: { params: { mobId: string | Promise<string> } }) {
  // Use session client for authenticated write operation
  const supabase = await createSessionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
  }

  try {
    // FIX: Await params to ensure the dynamic segment value is resolved
    const resolvedParams = await params;
    const mobIdStr = resolvedParams.mobId;
    const mobId = Number(mobIdStr);

    if (!mobIdStr || isNaN(mobId)) {
      return NextResponse.json({ error: "Invalid mob ID format in URL." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("mobs")
      .delete()
      .eq("mobid", mobId)
      .select()
      .single()

    if (error) {
      console.error("DELETE Mob DB Error:", error.message);
      return NextResponse.json({ error: `Failed to delete mob: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    console.error("DELETE Mob Exception:", err);
    return NextResponse.json({ error: "Failed to delete mob" }, { status: 500 })
  }
}