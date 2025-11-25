"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronDown, ChevronUp } from "lucide-react"

interface GameDetailModalProps {
  gameId: number
  onClose: () => void
}

export function GameDetailModal({ gameId, onClose }: GameDetailModalProps) {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    characters: true,
    maps: false,
    mobs: false,
    storyArcs: false,
  })
  const [gameData, setGameData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  useEffect(() => {
    const fetchGameDetails = async () => {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`/api/games/${gameId}`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setGameData({
          ...data,
          characters: data.characters || [],
          maps: data.maps || [],
          mobs: data.mobs || [],
          storyArcs: data.storyArcs || [],
          contributors: data.contributors || [],
        })
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchGameDetails()
  }, [gameId])

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl border-2 border-accent">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Loading game details...</p>
        </CardContent>
      </Card>
    </div>
  )

  if (error || !gameData) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-xl border-2 border-red-500 bg-card">
        <CardHeader className="border-b-2 border-red-500 flex justify-between items-start">
          <CardTitle className="text-xl text-red-500">Failed to load game</CardTitle>
          <button onClick={onClose} className="p-1 hover:bg-red-500/20 rounded">
            <X size={24} className="text-red-500" />
          </button>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Could not fetch game details.</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-2 border-accent bg-card my-8">
        <CardHeader className="border-b-2 border-accent flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-primary">{gameData.title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Released: {new Date(gameData.releasedate).toLocaleDateString()}
            </CardDescription>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent/20 rounded">
            <X size={24} className="text-accent" />
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Overview */}
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
                {gameData.gamelogourl && (
                  <div className="w-32 h-32 bg-muted rounded overflow-hidden">
                    <img src={gameData.gamelogourl} alt="Game Logo" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Plot Summary</p>
                  <p className="text-foreground">{gameData.plotsummary || "No description available"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Multiplayer</p>
                    <p className="text-foreground">{gameData.multiplayersupport ? "Yes" : "Single Player"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Characters */}
          <Section title="Characters" items={gameData.characters} expanded={expandedSections.characters} toggle={() => toggleSection("characters")} renderItem={(char: any) => (
            <div key={char.characterid} className="p-2 bg-muted rounded">
              <p className="font-semibold text-foreground">{char.charactername}</p>
              <p className="text-sm text-muted-foreground">{char.backstory}</p>
            </div>
          )} />

          {/* Maps */}
          <Section title="Maps" items={gameData.maps} expanded={expandedSections.maps} toggle={() => toggleSection("maps")} renderItem={(map: any) => (
            <div key={map.mapid} className="p-2 bg-muted rounded">
              <p className="font-semibold text-foreground">{map.mapname}{map.floorname && ` (${map.floorname})`}</p>
              <p className="text-sm text-muted-foreground">{map.description}</p>
            </div>
          )} />

          {/* Mobs */}
          <Section title="Enemies" items={gameData.mobs} expanded={expandedSections.mobs} toggle={() => toggleSection("mobs")} renderItem={(mob: any) => (
            <div key={mob.mobid} className="p-2 bg-muted rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-foreground">{mob.mobname}</p>
                  <p className="text-sm text-muted-foreground">{mob.description}</p>
                </div>
                <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">{mob.mobtype}</span>
              </div>
              {mob.weakness && <p className="text-xs mt-1 text-muted-foreground">Weakness: <span className="font-semibold">{mob.weakness}</span></p>}
            </div>
          )} />

          {/* Story Arcs */}
          <Section title="Story Arcs" items={gameData.storyArcs} expanded={expandedSections.storyArcs} toggle={() => toggleSection("storyArcs")} renderItem={(arc: any) => (
            <div key={arc.storyarcid} className="p-2 bg-muted rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-foreground">{arc.arctitle}</p>
                  <p className="text-sm text-muted-foreground">{arc.summary}</p>
                </div>
                {arc.ismainarc && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Main Arc</span>}
              </div>
            </div>
          )} />

          {/* Contributors */}
          <Section title="Contributors" items={gameData.contributors} expanded={true} toggle={() => {}} renderItem={(contrib: any, idx: number) => (
            <div key={idx} className="p-2 bg-muted rounded">
              <p className="font-semibold text-foreground">{contrib.contributorname}</p>
              <div className="flex gap-2 text-xs mt-1">
                <span className="text-muted-foreground">{contrib.rolename}</span>
                {contrib.specialization && <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{contrib.specialization}</span>
                </>}
              </div>
            </div>
          )} />

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

// reusable section component
function Section({ title, items, expanded, toggle, renderItem }: any) {
  return (
    <div className="border-l-4 border-accent">
      <button onClick={toggle} className="w-full flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded">
        <h3 className="font-bold text-primary text-lg">{title} ({items?.length || 0})</h3>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {expanded && (
        <div className="p-4 space-y-2">
          {items && items.length > 0 ? items.map(renderItem) : <p className="text-muted-foreground">No {title.toLowerCase()} found</p>}
        </div>
      )}
    </div>
  )
}