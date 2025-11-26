"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GamesGallery } from "@/components/games-gallery"
import { AddGameForm } from "@/components/add-game-form"
import { CharacterBrowser } from "@/components/character-browser"
import { MapBrowser } from "@/components/map-browser"
import { MobBrowser } from "@/components/mob-browser"
import { AccountDetails } from "@/components/account-details"
import { RatingsBrowser } from "@/components/ratings-browser"
import { ClipBrowser } from "@/components/clip-browser"
import { DashboardHome } from "@/components/dashboard-home"
import { Menu, Star, X } from "lucide-react"

interface DashboardProps {
  user: {
    userid: string; // UUID string
    username: string;
    email: string;
    isdev: boolean;
  }
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [view, setView] = useState<"home" | "browse" | "add" | "characters" | "maps" | "mobs" | "ratings" | "add-rating" | "account" | "clips" | "add-clip">("home")
  const [userRole, setUserRole] = useState<"dev" | "editor" | "viewer">(user.isdev ? "dev" : "viewer")
  const [games, setGames] = useState<any[]>([])
  const [characters, setCharacters] = useState<any[]>([])
  const [maps, setMaps] = useState<any[]>([])
  const [mobs, setMobs] = useState<any[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [clips, setClips] = useState<any[]>([])

  const [gameIdForRating, setGameIdForRating] = useState<any[]>([])
  const [gameIdForClip, setGameIdForClip] = useState<any[]>([])

  const [loadingGames, setLoadingGames] = useState(true)
  const [loadingCharacters, setLoadingCharacters] = useState(true)
  const [loadingMaps, setLoadingMaps] = useState(true)
  const [loadingMobs, setLoadingMobs] = useState(true)
  const [loadingRatings, setLoadingRatings] = useState(true)
  const [loadingClips, setLoadingClips] = useState(true)

  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchGames()
    fetchCharacters()
    fetchMaps()
    fetchMobs()
    fetchRatings()
    fetchClips()
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

  const handleGameAdded = () => { fetchGames(); setView("browse") }
  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/characters")
      const data = await response.json()
      const formatted = (data.characters || []).map((c: any) => ({
        characterid: c.characterid,
        name: c.charactername,
        description: c.description,
        backstory: c.backstory,
        englishva: c.englishva,
        japaneseva: c.japaneseva,
        motioncapture: c.motioncapture,
        spriteurl: c.spriteurl,
      }))
      setCharacters(formatted)
    } catch (err) { console.error(err); setCharacters([]) }
    finally { setLoadingCharacters(false) }
  }
  const handleCharacterAdded = () => { fetchCharacters(); setView("characters") }

  const fetchMobs = async () => {
    try {
      const response = await fetch("/api/mobs")
      const data = await response.json()
      const formatted = (data.mobs || []).map((mob: any) => ({
        mobid: mob.mobid,
        mobname: mob.mobname,
        mobtype: mob.mobtype,
        description: mob.description,
        weakness: mob.weakness,
        mobspriteurl: mob.mobspriteurl,
        spawnnotes: mob.spawnnotes,
      }))
      setMobs(formatted)
    } catch (err) { console.error(err) }
    finally { setLoadingMobs(false) }
  }
  const handleMobAdded = () => { fetchMobs(); setView("mobs") }

  const fetchMaps = async () => {
    try {
      const response = await fetch("/api/maps")
      const data = await response.json()
      const formatted = (data.maps || []).map((map: any) => ({
        mapid: map.mapid,
        mapname: map.mapname,
        floorname: map.floorname,
        description: map.description,
        mapurl: map.mapurl,
      }))
      setMaps(formatted)
    } catch (err) { console.error(err) }
    finally { setLoadingMaps(false) }
  }
  const handleMapAdded = () => { fetchMaps(); setView("maps") }

  const fetchRatings = async () => {
    try {
      const response = await fetch("/api/ratings")
      const data = await response.json()
      const formatted = (data.ratings || []).map((r: any) => ({
        ratingid: r.ratingid,
        rating: r.rating,
        review: r.review,
        reviewtimestamp: r.reviewtimestamp,
        personalbest: r.personalbest
      }))
      setRatings(formatted)
    } catch (err) { console.error(err) }
    finally { setLoadingRatings(false) }
  }
  const handleRatingAdded = () => { fetchRatings(); setView("ratings") }
  const handleInitiateAddRating = (gameId?: string) => { setGameIdForRating(gameId ? [gameId] : []); setView("add-rating") }

  const fetchClips = async () => {
    try {
      const response = await fetch("/api/clips")
      const data = await response.json()
      const formatted = (data.clips || []).map((clip: any) => ({
        clipid: clip.clipid,
        clipname: clip.clipname,
        description: clip.description,
        clipurl: clip.clipurl,
      }))
      setClips(formatted)
    } catch (err) { console.error(err) }
    finally { setLoadingClips(false) }
  }
  const handleClipAdded = () => { fetchClips(); setView("clips") }
  const handleInitiateAddClip = (gameId?: string) => { setGameIdForClip(gameId ? [gameId] : []); setView("add-clip") }

  const navItems = [
    { id: "home", label: "dashboard" },
    { id: "browse", label: "browse games" },
    { id: "ratings", label: "game ratings", icon: Star },
    { id: "characters", label: "characters" },
    { id: "maps", label: "maps" },
    { id: "mobs", label: "mobs" },
    { id: "clips", label: "clips" },
  ]

  const displayName = user.username && user.username.length > 0
    ? user.username
    : (user.email ? user.email.split('@')[0] : 'Account')

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="bg-black border-b-4 border-red-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => setView("home")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.jpg" alt="Logo" className="h-16 w-auto" />
            <div className="text-2xl font-bold tracking-widest text-red-500" style={{ fontFamily: 'Press Start 2P, monospace' }}>CRIMSON.</div>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { setView("account"); setMenuOpen(false); }}
              className="text-sm underline hover:text-red-500 transition-colors"
            >
              {displayName}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-red-700 rounded transition-colors">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="bg-black border-t border-red-600">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:gap-2 space-y-2 md:space-y-0">
              {navItems.map(item => (
                <Button
                  key={item.id}
                  onClick={() => { setView(item.id as any); setMenuOpen(false) }}
                  className={`w-full md:w-auto justify-start transition-all ${view === item.id ? "bg-red-800 text-white" : "border-red-500 text-red-500 hover:text-black bg-black"}`}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                onClick={onLogout}
                className="w-full md:w-auto justify-start bg-black text-red-500 border-red-500 hover:text-white md:ml-auto transition-all"
              >
                logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {view === "account" && <AccountDetails user={user} onBack={() => setView("home")} />}
        {view === "home" && <DashboardHome games={games} characters={characters} maps={maps} mobs={mobs} userRole={userRole} onNavigate={setView} />}
        {view === "browse" && <GamesGallery games={games} loading={loadingGames} onRefresh={fetchGames} />}
        {view === "add" && userRole === "dev" && <AddGameForm onGameAdded={handleGameAdded} />}
        {view === "ratings" && <RatingsBrowser ratings={ratings} loading={loadingRatings} onRefresh={fetchRatings} onAddRating={() => handleInitiateAddRating(undefined)} />}
        {view === "characters" && <CharacterBrowser characters={characters} loading={loadingCharacters} onRefresh={fetchCharacters} onCharacterAdded={handleCharacterAdded} />}
        {view === "maps" && <MapBrowser maps={maps} loading={loadingMaps} onRefresh={fetchMaps} onMapAdded={handleMapAdded} />}
        {view === "mobs" && <MobBrowser mobs={mobs} loading={loadingMobs} onRefresh={fetchMobs} onMobAdded={handleMobAdded} />}
        {view === "clips" && <ClipBrowser clips={clips} loading={loadingClips} onRefresh={fetchClips} onAddClip={() => handleInitiateAddClip(undefined)} />}
      </main>
    </div>
  )
}
