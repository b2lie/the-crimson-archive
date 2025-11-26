import { createClient, createSessionClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// --- GET Handler (Public Read) ---
// FIX: Using robust parameter resolution to handle potential Promise<string> from Next.js dynamic routes.
export async function GET(request: NextRequest, { params }: { params: { clipId: string | Promise<string> } }) {
  try {
    const resolvedParams = await params; // Await params to ensure value is resolved
    const clipIdStr = resolvedParams.clipId; // Access using the folder name [clipId]
    const clipId = Number(clipIdStr);

    if (!clipIdStr || isNaN(clipId)) {
      return NextResponse.json({ error: "Invalid clip ID" }, { status: 400 });
    }
    
    // Use the unauthenticated client for public read
    const supabase = await createClient() 

    // 2. Fetch the clip.
    const { data: clip, error } = await supabase
      .from("clips")
      .select("*")
      .eq("clipid", clipId)
      .single()

    if (error || !clip) {
      console.error("GET Clip Error:", error?.message || 'Clip not found.');
      return NextResponse.json({ error: "Clip not found" }, { status: 404 })
    }

    return NextResponse.json(clip, { status: 200 })
  } catch (err) {
    console.error("GET Clip Exception:", err);
    return NextResponse.json({ error: "Failed to fetch clip" }, { status: 500 })
  }
}

// --- PUT Handler (Authenticated Update) ---
// FIX: Using robust parameter resolution to handle potential Promise<string> from Next.js dynamic routes.
export async function PUT(request: NextRequest, { params }: { params: { clipId: string | Promise<string> } }) {
  const supabase = await createSessionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
  }

  try {
    const resolvedParams = await params; // Await params to ensure value is resolved
    const clipIdStr = resolvedParams.clipId; // Access using the folder name [clipId]
    const clipId = Number(clipIdStr);
    
    const clipData = await request.json()
    
    // CRITICAL FIX FOR NaN ERROR: Validate parameter conversion immediately
    if (isNaN(clipId) || !clipIdStr) {
      return NextResponse.json({ error: "Invalid clip ID format in URL." }, { status: 400 });
    }
    
    // 1. INPUT VALIDATION: Prevents 400 errors from malformed client data
    if (Object.keys(clipData).length === 0) {
      return NextResponse.json({ error: "No update data provided." }, { status: 400 });
    }
    
    // 2. Database Update
    const { data, error } = await supabase
      .from("clips")
      .update(clipData)
      .eq("clipid", clipId)
      .select()
      .single()

    if (error || !data) {
      console.error("PUT Clip DB Error:", error?.message);
      const status = error && error.message.includes('permission denied') ? 403 : 400;
      return NextResponse.json({ error: `Failed to update clip: ${error?.message || 'Data not found.'}` }, { status: status });
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error("PUT Clip Exception:", err);
    return NextResponse.json({ error: "Failed to update clip" }, { status: 500 })
  }
}

// --- DELETE Handler (Authenticated Delete) ---
// FIX: Using robust parameter resolution to handle potential Promise<string> from Next.js dynamic routes.
export async function DELETE(request: NextRequest, { params }: { params: { clipId: string | Promise<string> } }) {
  const supabase = await createSessionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
  }
  
  try {
    const resolvedParams = await params; // Await params to ensure value is resolved
    const clipIdStr = resolvedParams.clipId; // Access using the folder name [clipId]
    const clipId = Number(clipIdStr);
    
    // CRITICAL FIX FOR NaN ERROR: Validate parameter conversion immediately
    if (isNaN(clipId) || !clipIdStr) {
      return NextResponse.json({ error: "Invalid clip ID format in URL." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("clips")
      .delete()
      .eq("clipid", clipId)
      .select()
      .single()

    if (error) {
      console.error("DELETE Clip DB Error:", error.message);
      const status = error.message.includes('permission denied') ? 403 : 400;
      return NextResponse.json({ error: `Failed to delete clip: ${error.message}` }, { status: status })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    console.error("DELETE Clip Exception:", err);
    return NextResponse.json({ error: "Failed to delete clip" }, { status: 500 })
  }
}