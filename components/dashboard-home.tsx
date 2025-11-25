"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, Users, Map, Zap, Plus, Eye } from "lucide-react"

interface DashboardHomeProps {
  games: any[]
  characters: any[]
  onNavigate: (view: "home" | "browse" | "add" | "characters" | "maps" | "mobs") => void
}

export function DashboardHome({ games, characters, onNavigate }: DashboardHomeProps) {
  const stats = [
    {
      title: "Total Games",
      value: games.length,
      icon: Gamepad2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Characters",
      value: characters.length,
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Maps",
      value: "0",
      icon: Map,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Enemies",
      value: "0",
      icon: Zap,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  const quickActions = [
    {
      title: "Add Game",
      description: "Create a new game entry",
      icon: Plus,
      action: () => onNavigate("add"),
      color: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
    {
      title: "Browse Games",
      description: "View all games in the database",
      icon: Eye,
      action: () => onNavigate("browse"),
      color: "bg-accent text-accent-foreground hover:bg-accent/90",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground p-8 rounded-lg border-2 border-accent">
        <h1 className="text-4xl font-bold mb-2">Welcome to Crimson Database</h1>
        <p className="text-lg opacity-90">
          Manage and explore your comprehensive gaming database with detailed character, map, and story arc information.
        </p>
      </div>

      {/* Statistics Grid */}
      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">Database Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="border-2 border-primary bg-card hover:border-accent transition-colors">
                <CardHeader className="pb-3">
                  <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                    <Icon className={`${stat.color} w-6 h-6`} />
                  </div>
                  <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <Button
                key={idx}
                onClick={action.action}
                className={`${action.color} h-auto p-6 border-2 border-current justify-start flex-col items-start`}
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
            <h2 className="text-2xl font-bold text-primary">Recent Games</h2>
            <Button
              onClick={() => onNavigate("browse")}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.slice(0, 3).map((game) => (
              <Card
                key={game.gameID}
                className="border-2 border-primary hover:border-accent transition-colors bg-card cursor-pointer"
                onClick={() => onNavigate("browse")}
              >
                {game.gameCoverURL && (
                  <div className="w-full h-32 bg-muted overflow-hidden rounded-t">
                    <img
                      src={game.gameCoverURL || "/placeholder.svg"}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-primary line-clamp-1">{game.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {new Date(game.releaseDate).getFullYear()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2 text-muted-foreground">{game.plotSummary}</p>
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
            <h2 className="text-2xl font-bold text-primary">Recent Characters</h2>
            <Button
              onClick={() => onNavigate("characters")}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.slice(0, 3).map((char) => (
              <Card
                key={char.characterID}
                className="border-2 border-primary hover:border-accent transition-colors bg-card cursor-pointer"
                onClick={() => onNavigate("characters")}
              >
                {char.spriteURL && (
                  <div className="w-full h-32 bg-muted overflow-hidden rounded-t">
                    <img src={char.spriteURL || "/placeholder.svg"} alt={char.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-primary line-clamp-1">{char.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {char.englishVA && `English VA: ${char.englishVA}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2 text-muted-foreground">{char.backstory}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}


      {/* Navigation Help */}
      <Card className="border-2 border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">Navigation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-bold text-primary">Browse Games:</span> View all games with detailed information and
            expand to see related entities.
          </p>
          <p>
            <span className="font-bold text-primary">Add Game:</span> Create new game entries and manage characters,
            maps, and story arcs using tabbed forms.
          </p>
          <p>
            <span className="font-bold text-primary">Characters, Maps, Enemies:</span> Browse and manage individual
            entities with search and edit functionality.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
