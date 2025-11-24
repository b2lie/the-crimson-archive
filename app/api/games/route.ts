import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // TODO: Integrate with Flask backend to fetch games from PostgreSQL
    // Placeholder data
    const games = [
      {
        gameID: 1,
        title: "Example Game",
        plotSummary: "A thrilling adventure awaits",
        releaseDate: "2024-01-01",
        gameCoverURL: "/game-cover.jpg",
        gameLogoURL: "",
        multiplayerSupport: true,
      },
    ]

    return NextResponse.json({ games }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const gameData = await request.json()

    // TODO: Integrate with Flask backend to save game to PostgreSQL
    if (!gameData.title || !gameData.releaseDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Placeholder response
    return NextResponse.json(
      {
        gameID: Date.now(),
        ...gameData,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to add game" }, { status: 500 })
  }
}
