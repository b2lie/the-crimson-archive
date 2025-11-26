"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, Users, Map, Zap, Plus, Eye, User as UserIconPlaceholder, Star } from "lucide-react"

interface DashboardHomeProps {
  games: any[]
  characters: any[]
  maps: any[]
  mobs: any[]
  userRole: "dev" | "editor" | "viewer"
  onNavigate: (view: "home" | "browse" | "add" | "characters" | "maps" | "mobs") => void
}

export function DashboardHome({ games, characters, maps, mobs, userRole, onNavigate }: DashboardHomeProps) {

  const stats = [
    { title: "total games", value: games.length, icon: Gamepad2, color: "text-red-500", bgColor: "bg-red-500/10" },
    { title: "characters", value: characters.length, icon: Users, color: "text-white", bgColor: "bg-white/10" },
    { title: "maps", value: maps.length, icon: Map, color: "text-red-500", bgColor: "bg-red-500/10" },
    { title: "enemies", value: mobs.length, icon: Zap, color: "text-white", bgColor: "bg-white/10" },
  ]

  const quickActions: any[] = []

  if (userRole === "dev") {
    quickActions.push({
      title: "Add Game",
      description: "Create a new game entry",
      icon: Plus,
      action: () => onNavigate("add"),
      color: "bg-red-500 text-black hover:bg-red-600",
    })
  }

  quickActions.push({
    title: "Browse Games",
    description: "View all games in the database",
    icon: Eye,
    action: () => onNavigate("browse"),
    color: "bg-white text-black hover:bg-white/90",
  })

  return (
    <div className="space-y-8 font-sans text-white">
      {/* Hero Section */}
      <div className="bg-black border-red-500 rounded-lg shadow-md py-10 space-y-4">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: 'Press Start 2P, monospace', color: "#ff2b2b" }}
        >
          navigation.
        </h1>

        <div className="flex flex-wrap gap-4">
          <a
            onClick={() => onNavigate("browse")}
            className="text-red-500 font-bold text-lg px-3 py-2 border-red-500 rounded hover:text-white hover:shadow-[0_0_8px_red] transition-all cursor-pointer"
            style={{ fontFamily: 'Press Start 2P, monospace' }}
          >
            browse games
          </a>

          {userRole === "dev" && (
            <a
              onClick={() => onNavigate("add")}
              className="text-red-500 font-bold text-lg px-3 py-2 border-red-500 rounded hover:text-white transition-all cursor-pointer"
              style={{ fontFamily: 'Press Start 2P, monospace' }}
            >
              add game
            </a>
          )}

          <a
            onClick={() => onNavigate("characters")}
            className="text-red-500 font-bold text-lg px-3 py-2 border-red-500 rounded hover:text-white hover:shadow-[0_0_8px_red] transition-all cursor-pointer"
            style={{ fontFamily: 'Press Start 2P, monospace' }}
          >
            characters
          </a>

          <a
            onClick={() => onNavigate("maps")}
            className="text-red-500 font-bold text-lg px-3 py-2 border-red-500 rounded hover:text-white hover:shadow-[0_0_8px_red] transition-all cursor-pointer"
            style={{ fontFamily: 'Press Start 2P, monospace' }}
          >
            maps
          </a>

          <a
            onClick={() => onNavigate("mobs")}
            className="text-red-500 font-bold text-lg px-3 py-2 border-red-500 rounded hover:text-white hover:shadow-[0_0_8px_red] transition-all cursor-pointer"
            style={{ fontFamily: 'Press Start 2P, monospace' }}
          >
            mobs
          </a>
        </div>
      </div>


      {/* Statistics Grid */}
      <div>
        <h2 className="text-2xl font-bold text-red-500 mb-4" style={{ fontFamily: 'Press Start 2P, monospace' }}>database overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="border-2 border-red-500 bg-black hover:shadow-[0_0_8px_red] transition-all">
                <CardHeader className="pb-3 flex flex-col items-center">
                  <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                    <Icon className={`${stat.color} w-6 h-6`} />
                  </div>
                  <CardTitle className="text-sm text-gray-300 text-center">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-red-500">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-red-500 mb-4" style={{ fontFamily: 'Press Start 2P, monospace' }}>quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <Button
                key={idx}
                onClick={action.action}
                className={`${action.color} h-auto p-6 border-2 border-red-500 justify-start flex-col items-start hover:shadow-[0_0_8px_red] transition-all`}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon size={32} />
                  <div className="text-left">
                    <div className="font-bold text-lg">{action.title}</div>
                    <div className="text-sm opacity-90">{action.description}</div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Recent Games */}
      {games.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-500" style={{ fontFamily: 'Press Start 2P, monospace' }}>recent games</h2>
            <Button onClick={() => onNavigate("browse")} className="bg-white text-black border-2 border-red-500 hover:bg-white/90 hover:shadow-[0_0_6px_red] transition-all">View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.slice(0, 3).map((game) => (
              <Card key={game.gameid} className="border-2 border-red-500 hover:shadow-[0_0_8px_red] transition-all bg-black cursor-pointer" onClick={() => onNavigate("browse")}>
                <div className="w-full h-40 overflow-hidden rounded-t flex items-center justify-center p-4">
                  {game.gamelogourl ? (
                    <img
                      src={game.gamelogourl}
                      alt={game.title}
                      className="object-contain max-w-full max-h-full"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/160x160/292524/ffffff?text=Logo'; }}
                    />
                  ) : <Gamepad2 className="w-16 h-16 text-gray-400" />}
                </div>
                <CardHeader>
                  <CardTitle className="text-red-500 line-clamp-1">{game.title}</CardTitle>
                  <CardDescription className="text-gray-300">{new Date(game.releasedate).getFullYear()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2 text-gray-400">{game.plotsummary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Characters */}
      {characters.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-500" style={{ fontFamily: 'Press Start 2P, monospace' }}>recent characters</h2>
            <Button onClick={() => onNavigate("characters")} className="bg-white text-black border-2 border-red-500 hover:bg-white/90 hover:shadow-[0_0_6px_red] transition-all">View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.slice(0, 3).map((char) => (
              <Card key={char.characterid} className="border-2 border-red-500 hover:shadow-[0_0_8px_red] transition-all bg-black cursor-pointer" onClick={() => onNavigate("characters")}>
                <div className="w-full h-40 overflow-hidden rounded-t flex items-center justify-center p-4">
                  {char.spriteurl ? (
                    <img
                      src={char.spriteurl}
                      alt={char.name}
                      className="object-contain max-w-full max-h-full"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/160x160/292524/ffffff?text=Char'; }}
                    />
                  ) : <UserIconPlaceholder className="w-16 h-16 text-gray-400" />}
                </div>
                <CardHeader>
                  <CardTitle className="text-red-500 line-clamp-1">{char.name}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {char.englishva && `English VA: ${char.englishva}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2 text-gray-400">{char.backstory}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <br/>

      <Card className="w-full py-10 mt-8 bg-black hover:shadow-[0_0_8px_red] transition-all">
        <CardContent>
          <img src="/default-pfp.jpg" alt="The Crimson Archive Logo" className="w-16 h-16 mb-4 mx-auto" />
          <p className="text-sm text-gray-400 text-center px-100">
            <b>Welcome to The Crimson Archive Dashboard!</b><br/> <br/>Here you can manage and explore the extensive database of games, characters, maps, and enemies. Use the navigation links above to get started, and take advantage of the quick actions for efficient workflow. <br/><br /> Happy archiving!
          </p>
          <Star size={28} className="text-yellow-400 mt-4 mx-auto" />
        </CardContent>
      </Card>

    </div>
  )
}
