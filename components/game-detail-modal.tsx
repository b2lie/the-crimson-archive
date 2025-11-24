"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronDown, ChevronUp } from "lucide-react"

interface GameDetailModalProps {
  game: any
  onClose: () => void
}

export function GameDetailModal({ game, onClose }: GameDetailModalProps) {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    characters: true,
    maps: false,
    mobs: false,
    storyArcs: false,
  })
  const [gameData, setGameData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGameDetails()
  }, [game.gameID])

  const fetchGameDetails = async () => {
    try {
      // TODO: Replace with actual API call to Flask backend
      const mockData = {
        ...game,
        characters: [
          { characterID: 1, characterName: "Hero", backstory: "The main protagonist" },
          { characterID: 2, characterName: "Rival", backstory: "A skilled opponent" },
        ],
        maps: [
          { mapID: 1, mapName: "Starting Village", floorName: "Ground", description: "Where the adventure begins" },
          { mapID: 2, mapName: "Dark Forest", floorName: "1F", description: "A dangerous wilderness" },
        ],
        mobs: [
          { mobID: 1, mobName: "Goblin", mobType: "Enemy", weakness: "Fire", description: "Small green creature" },
          { mobID: 2, mobName: "Orc Warrior", mobType: "Boss", weakness: "Ice", description: "Powerful foe" },
        ],
        storyArcs: [
          {
            storyArcID: 1,
            arcTitle: "Introduction",
            arcOrder: 1.0,
            isMainArc: true,
            summary: "Meet the main character",
          },
          {
            storyArcID: 2,
            arcTitle: "The Quest Begins",
            arcOrder: 2.0,
            isMainArc: true,
            summary: "Start the main journey",
          },
        ],
        contributors: [
          { contributorName: "John Developer", specialization: "Programmer", roleName: "Lead Developer" },
          { contributorName: "Jane Artist", specialization: "Art", roleName: "Character Designer" },
        ],
      }
      setGameData(mockData)
    } catch (err) {
      console.error("Failed to fetch game details:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl border-2 border-accent">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Loading game details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gameData) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-2 border-accent bg-card my-8">
        <CardHeader className="border-b-2 border-accent flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-primary">{gameData.title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Released: {new Date(gameData.releaseDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent/20 rounded">
            <X size={24} className="text-accent" />
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Overview Section */}
          <div className="border-l-4 border-accent">
            <button
              onClick={() => toggleSection("overview")}
              className="w-full flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded"
            >
              <h3 className="font-bold text-primary text-lg">Overview</h3>
              {expandedSections.overview ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.overview && (
              <div className="p-4 space-y-3">
                {gameData.gameLogoURL && (
                  <div className="w-32 h-32 bg-muted rounded overflow-hidden">
                    <img
                      src={gameData.gameLogoURL || "/placeholder.svg"}
                      alt="Game Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Plot Summary</p>
                  <p className="text-foreground">{gameData.plotSummary || "No description available"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Multiplayer</p>
                    <p className="text-foreground">{gameData.multiplayerSupport ? "Yes" : "Single Player"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Characters Section */}
          <div className="border-l-4 border-accent">
            <button
              onClick={() => toggleSection("characters")}
              className="w-full flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded"
            >
              <h3 className="font-bold text-primary text-lg">Characters ({gameData.characters?.length || 0})</h3>
              {expandedSections.characters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.characters && (
              <div className="p-4 space-y-2">
                {gameData.characters && gameData.characters.length > 0 ? (
                  gameData.characters.map((char: any) => (
                    <div key={char.characterID} className="p-2 bg-muted rounded">
                      <p className="font-semibold text-foreground">{char.characterName}</p>
                      <p className="text-sm text-muted-foreground">{char.backstory}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No characters found</p>
                )}
              </div>
            )}
          </div>

          {/* Maps Section */}
          <div className="border-l-4 border-accent">
            <button
              onClick={() => toggleSection("maps")}
              className="w-full flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded"
            >
              <h3 className="font-bold text-primary text-lg">Maps ({gameData.maps?.length || 0})</h3>
              {expandedSections.maps ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.maps && (
              <div className="p-4 space-y-2">
                {gameData.maps && gameData.maps.length > 0 ? (
                  gameData.maps.map((map: any) => (
                    <div key={map.mapID} className="p-2 bg-muted rounded">
                      <p className="font-semibold text-foreground">
                        {map.mapName} {map.floorName && `(${map.floorName})`}
                      </p>
                      <p className="text-sm text-muted-foreground">{map.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No maps found</p>
                )}
              </div>
            )}
          </div>

          {/* Mobs Section */}
          <div className="border-l-4 border-accent">
            <button
              onClick={() => toggleSection("mobs")}
              className="w-full flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded"
            >
              <h3 className="font-bold text-primary text-lg">Enemies ({gameData.mobs?.length || 0})</h3>
              {expandedSections.mobs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.mobs && (
              <div className="p-4 space-y-2">
                {gameData.mobs && gameData.mobs.length > 0 ? (
                  gameData.mobs.map((mob: any) => (
                    <div key={mob.mobID} className="p-2 bg-muted rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">{mob.mobName}</p>
                          <p className="text-sm text-muted-foreground">{mob.description}</p>
                        </div>
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                          {mob.mobType}
                        </span>
                      </div>
                      {mob.weakness && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          Weakness: <span className="font-semibold">{mob.weakness}</span>
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No enemies found</p>
                )}
              </div>
            )}
          </div>

          {/* Story Arcs Section */}
          <div className="border-l-4 border-accent">
            <button
              onClick={() => toggleSection("storyArcs")}
              className="w-full flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded"
            >
              <h3 className="font-bold text-primary text-lg">Story Arcs ({gameData.storyArcs?.length || 0})</h3>
              {expandedSections.storyArcs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections.storyArcs && (
              <div className="p-4 space-y-2">
                {gameData.storyArcs && gameData.storyArcs.length > 0 ? (
                  gameData.storyArcs.map((arc: any) => (
                    <div key={arc.storyArcID} className="p-2 bg-muted rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">{arc.arcTitle}</p>
                          <p className="text-sm text-muted-foreground">{arc.summary}</p>
                        </div>
                        {arc.isMainArc && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Main Arc</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No story arcs found</p>
                )}
              </div>
            )}
          </div>

          {/* Contributors Section */}
          <div className="border-l-4 border-accent">
            <div className="p-3 bg-primary/10 rounded">
              <h3 className="font-bold text-primary text-lg">Contributors ({gameData.contributors?.length || 0})</h3>
            </div>
            <div className="p-4 space-y-2">
              {gameData.contributors && gameData.contributors.length > 0 ? (
                gameData.contributors.map((contrib: any, idx: number) => (
                  <div key={idx} className="p-2 bg-muted rounded">
                    <p className="font-semibold text-foreground">{contrib.contributorName}</p>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-muted-foreground">{contrib.roleName}</span>
                      {contrib.specialization && <span className="text-muted-foreground">•</span>}
                      {contrib.specialization && (
                        <span className="text-muted-foreground">{contrib.specialization}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No contributors found</p>
              )}
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-accent"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
