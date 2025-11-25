"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GamesGallery } from "./games-gallery"
import { AddGameForm } from "./add-game-form"
import { CharacterBrowser } from "./character-browser"
import { MapBrowser } from "./map-browser"
import { MobBrowser } from "./mob-browser"
import { DashboardHome } from "./dashboard-home"
import { Menu, X } from "lucide-react"

interface DashboardProps {
  user: { username: string; email: string }
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [view, setView] = useState<"home" | "browse" | "add" | "characters" | "maps" | "mobs">("home")
  const [games, setGames] = useState<any[]>([])
  const [characters, setCharacters] = useState<any[]>([])
  const [maps, setMaps] = useState<any[]>([])
  const [mobs, setMobs] = useState<any[]>([])
  const [loadingGames, setLoadingGames] = useState(true)
  const [loadingCharacters, setLoadingCharacters] = useState(true)
  const [loadingMaps, setLoadingMaps] = useState(true)
  const [loadingMobs, setLoadingMobs] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchGames(),
    fetchCharacters(),
    fetchMaps(),
    fetchMobs()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/games")
      const data = await response.json()
      const formattedGames = (data.games || []).map((game: any) => ({
        gameid: game.gameid,
        title: game.title,
        releasedate: game.releasedate,
        plotsummary: game.plotsummary,
        gamecoverurl: game.gamecoverurl,
        gamelogourl: game.gamelogourl,
        multiplayersupport: game.multiplayersupport,
      }))
      setGames(formattedGames)
    } catch (err) {
      console.error("Failed to fetch games:", err)
    } finally {
      setLoadingGames(false)
    }
  }

  const handleGameAdded = () => {
    fetchGames()
    setView("browse")
  }

  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/characters");
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        setCharacters([]);
        return;
      }

      const formattedCharacters = (data.characters || []).map((char: any) => ({
        characterid: char.characterid,
        name: char.charactername,
        description: char.description,
        backstory: char.backstory,
        englishva: char.englishva,
        japaneseva: char.japaneseva,
        motioncapture: char.motioncapture,
        spriteurl: char.spriteurl,
      }));

      setCharacters(formattedCharacters);
    } catch (err) {
      console.error("Failed to fetch characters:", err);
      setCharacters([]);
    } finally {
      setLoadingCharacters(false);
    }
  };

  const handleCharacterAdded = () => {
    fetchCharacters()
    setView("characters")
  }

  const fetchMobs = async () => {
    try {
      const response = await fetch("/api/mobs")
      const data = await response.json()
      const formattedMobs = (data.mobs || []).map((mob: any) => ({
        mobid: mob.mobid,
        mobname: mob.mobname,
        mobtype: mob.mobtype,
        description: mob.description,
        weakness: mob.weakness,
        mobspriteurl: mob.mobspriteurl,
        spawnnotes: mob.spawnnotes,
      }))
      setMobs(formattedMobs)
    } catch (err) {
      console.error("Failed to fetch mobs:", err)
    } finally {
      setLoadingMobs(false)
    }
  }

  const handleMobAdded = () => {
    fetchMobs()
    setView("mobs")
  }

  const fetchMaps = async () => {
    try {
      const response = await fetch("/api/maps")
      const data = await response.json()
      const formattedMaps = (data.maps || []).map((map: any) => ({
        mapid: map.mapid,
        mapname: map.mapname,
        floorname: map.floorname,
        description: map.description,
        mapurl: map.mapurl,
      }))
      setMaps(formattedMaps)
    } catch (err) {
      console.error("Failed to fetch maps:", err)
    } finally {
      setLoadingMaps(false)
    }
  }

  const handleMapAdded = () => {
    fetchMaps()
    setView("maps")
  }

  const navItems = [
    { id: "home", label: "Dashboard" },
    { id: "browse", label: "Browse Games" },
    { id: "add", label: "Add Game" },
    { id: "characters", label: "Characters" },
    { id: "maps", label: "Maps" },
    { id: "mobs", label: "Mobs" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b-4 border-accent">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => setView("home")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="text-2xl font-bold">CRIMSON DB</div>
          </button>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-primary/80">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <div className="text-sm mr-4">{user.username}</div>
            {navItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => setView(item.id as any)}
                variant={view === item.id ? "default" : "outline"}
                className={`${view === item.id
                    ? "bg-accent text-accent-foreground"
                    : "border-primary-foreground text-primary-foreground hover:bg-primary/80"
                  }`}
              >
                {item.label}
              </Button>
            ))}
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary/80 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden bg-primary/95 border-t border-primary-foreground p-4 space-y-2">
            <div className="text-sm pb-2">{user.username}</div>
            {navItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => {
                  setView(item.id as any)
                  setMenuOpen(false)
                }}
                className="w-full justify-start"
                variant={view === item.id ? "default" : "outline"}
              >
                {item.label}
              </Button>
            ))}
            <Button onClick={onLogout} className="w-full justify-start bg-transparent" variant="outline">
              Logout
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {view === "home" && <DashboardHome games={games} characters={characters} maps={maps} mobs={mobs} onNavigate={setView}/>}
        {view === "browse" && <GamesGallery games={games} loading={loadingGames} onRefresh={fetchGames} />}
        {view === "add" && <AddGameForm onGameAdded={handleGameAdded} />}
        {view === "characters" && <CharacterBrowser characters={characters} loading={loadingCharacters} onRefresh={fetchCharacters} onCharacterAdded={handleCharacterAdded} />}
        {view === "maps" && <MapBrowser maps={maps} loading={loadingMaps} onRefresh={fetchMaps} onMapAdded={handleMapAdded} />}
        {view === "mobs" && <MobBrowser mobs={mobs} loading={loadingMobs} onRefresh={fetchMobs} onMobAdded={handleMobAdded} />}
      </main>
    </div>
  )
}