"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { GameDetailModal } from "./game-detail-modal"

interface GamesGalleryProps {
  games: any[]
  loading: boolean
  onRefresh: () => void
}

export function GamesGallery({ games, loading, onRefresh }: GamesGalleryProps) {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-lg text-muted-foreground">Loading games...</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Game Database</h1>
          <Button onClick={onRefresh} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <RefreshCw size={20} className="mr-2" />
            Refresh
          </Button>
        </div>

        {games.length === 0 ? (
          <Card className="border-2 border-primary bg-card">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No games found. Add one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <Card
                key={game.gameid}
                className="border-2 border-primary hover:border-accent transition-colors bg-card cursor-pointer"
                onClick={() => setSelectedGameId(game.gameid)}
              >
                {game.gamecoverurl && (
                  <div className="w-full bg-muted overflow-hidden rounded-t relative">
                    <div className="pb-[133.33%] leading-none"></div>
                    <img
                      src={game.gamecoverurl || "/placeholder.svg"}
                      alt={game.title}
                      className="object-cover absolute inset-0 rounded-t"
                    />
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-primary">{game.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Released: {new Date(game.releasedate).getFullYear()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{game.plotsummary}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      {game.multiplayersupport ? "Multiplayer" : "Single Player"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedGameId && (
        <GameDetailModal
          gameId={selectedGameId}
          onClose={() => setSelectedGameId(null)}
        />
      )}
    </>
  )
}