import { createClient, createSessionClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// --- GET Handler (Public Read) ---
export async function GET(request: NextRequest, { params }: { params: { ratingId: string | Promise<string> } }) {
  try {
    // FIX: Await params to ensure the dynamic segment value is resolved
    const resolvedParams = await params;
    const ratingIdStr = resolvedParams.ratingId;
    const ratingId = Number(ratingIdStr);

    if (!ratingIdStr || isNaN(ratingId)) {
      return NextResponse.json({ error: "Invalid rating ID format in URL." }, { status: 400 });
    }
    
    // Use the unauthenticated client for public read
    const supabase = await createClient() 

    const { data: rating, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("ratingid", ratingId)
      .single()

    if (error || !rating) {
      console.error("GET Rating Error:", error?.message || 'Rating not found.');
      return NextResponse.json({ error: "Rating not found" }, { status: 404 })
    }

    return NextResponse.json(rating, { status: 200 })
  } catch (err) {
    console.error("GET Rating Exception:", err);
    return NextResponse.json({ error: "Failed to fetch rating" }, { status: 500 })
  }
}

// --- PUT Handler (Authenticated Update) ---
export async function PUT(request: NextRequest, { params }: { params: { ratingId: string | Promise<string> } }) {
  // Use session client for authenticated write operation
  const supabase = await createSessionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
  }
  
  try {
    // FIX: Await params to ensure the dynamic segment value is resolved
    const resolvedParams = await params;
    const ratingIdStr = resolvedParams.ratingId;
    const ratingId = Number(ratingIdStr);

    if (!ratingIdStr || isNaN(ratingId)) {
      return NextResponse.json({ error: "Invalid rating ID format in URL." }, { status: 400 });
    }

    const ratingData = await request.json()
    const { data, error } = await supabase
      .from("ratings")
      .update(ratingData)
      .eq("ratingid", ratingId)
      .select()
      .single()

    if (error || !data) {
      console.error("PUT Rating DB Error:", error?.message);
      return NextResponse.json({ error: `Failed to update rating: ${error?.message || 'Data not found.'}` }, { status: 400 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error("PUT Rating Exception:", err);
    return NextResponse.json({ error: "Failed to update rating" }, { status: 500 })
  }
}

// --- DELETE Handler (Authenticated Delete) ---
export async function DELETE(request: NextRequest, { params }: { params: { ratingId: string | Promise<string> } }) {
  // Use session client for authenticated write operation
  const supabase = await createSessionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
  }

  try {
    // FIX: Await params to ensure the dynamic segment value is resolved
    const resolvedParams = await params;
    const ratingIdStr = resolvedParams.ratingId;
    const ratingId = Number(ratingIdStr);

    if (!ratingIdStr || isNaN(ratingId)) {
      return NextResponse.json({ error: "Invalid rating ID format in URL." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ratings")
      .delete()
      .eq("ratingid", ratingId)
      .select()
      .single()

    if (error) {
      console.error("DELETE Rating DB Error:", error.message);
      return NextResponse.json({ error: `Failed to delete rating: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    console.error("DELETE Rating Exception:", err);
    return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 })
  }
}