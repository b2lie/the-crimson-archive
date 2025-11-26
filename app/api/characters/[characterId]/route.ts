import { createClient, createSessionClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// --- GET Handler (Public Read) ---
// FIX: Using robust parameter resolution to handle potential Promise<string> from Next.js dynamic routes.
export async function GET(request: NextRequest, { params }: { params: { characterId: string | Promise<string> } }) {
  try {
    const resolvedParams = await params; // Await params to ensure value is resolved
    const characterIdStr = resolvedParams.characterId; // Access using the folder name [characterId]
    const characterId = Number(characterIdStr);

    if (!characterIdStr || isNaN(characterId)) {
      return NextResponse.json({ error: "Invalid character ID" }, { status: 400 });
    }
    
    // Use the unauthenticated client for public read
    const supabase = await createClient() 

    // 2. Fetch the character.
    const { data: character, error } = await supabase
      .from("ingamecharacters")
      .select("*")
      .eq("characterid", characterId)
      .single()

    if (error || !character) {
      console.error("GET Character Error:", error?.message || 'Character not found.');
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    return NextResponse.json(character, { status: 200 })
  } catch (err) {
    console.error("GET Character Exception:", err);
    return NextResponse.json({ error: "Failed to fetch character" }, { status: 500 })
  }
}

// --- PUT Handler (Authenticated Update) ---
// FIX: Using robust parameter resolution to handle potential Promise<string> from Next.js dynamic routes.
export async function PUT(request: NextRequest, { params }: { params: { characterId: string | Promise<string> } }) {
  const supabase = await createSessionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
  }

  try {
    const resolvedParams = await params; // Await params to ensure value is resolved
    const characterIdStr = resolvedParams.characterId; // Access using the folder name [characterId]
    const characterId = Number(characterIdStr);
    
    const characterData = await request.json()
    
    // CRITICAL FIX FOR NaN ERROR: Validate parameter conversion immediately
    if (isNaN(characterId) || !characterIdStr) {
      return NextResponse.json({ error: "Invalid character ID format in URL." }, { status: 400 });
    }
    
    // 1. INPUT VALIDATION: Prevents 400 errors from malformed client data
    if (Object.keys(characterData).length === 0) {
      return NextResponse.json({ error: "No update data provided." }, { status: 400 });
    }
    
    // 2. Database Update
    const { data, error } = await supabase
      .from("ingamecharacters")
      .update(characterData)
      .eq("characterid", characterId)
      .select()
      .single()

    if (error || !data) {
      console.error("PUT Character DB Error:", error?.message);
      const status = error && error.message.includes('permission denied') ? 403 : 400;
      return NextResponse.json({ error: `Failed to update character: ${error?.message || 'Data not found.'}` }, { status: status });
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error("PUT Character Exception:", err);
    return NextResponse.json({ error: "Failed to update character" }, { status: 500 })
  }
}

// --- DELETE Handler (Authenticated Delete) ---
// FIX: Using robust parameter resolution to handle potential Promise<string> from Next.js dynamic routes.
export async function DELETE(request: NextRequest, { params }: { params: { characterId: string | Promise<string> } }) {
  const supabase = await createSessionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
  }
  
  try {
    const resolvedParams = await params; // Await params to ensure value is resolved
    const characterIdStr = resolvedParams.characterId; // Access using the folder name [characterId]
    const characterId = Number(characterIdStr);
    
    // CRITICAL FIX FOR NaN ERROR: Validate parameter conversion immediately
    if (isNaN(characterId) || !characterIdStr) {
      return NextResponse.json({ error: "Invalid character ID format in URL." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ingamecharacters")
      .delete()
      .eq("characterid", characterId)
      .select()
      .single()

    if (error) {
      console.error("DELETE Character DB Error:", error.message);
      const status = error.message.includes('permission denied') ? 403 : 400;
      return NextResponse.json({ error: `Failed to delete character: ${error.message}` }, { status: status })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    console.error("DELETE Character Exception:", err);
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 })
  }
}