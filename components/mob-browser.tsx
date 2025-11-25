"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Edit2, Trash2 } from "lucide-react"
import { MobEditModal } from "./mob-edit-modal"

interface Mob {
  mobid: number;
  mobname: string;
  mobtype: string;
  description: string;
  weakness: string;
  mobspriteurl: string;
  spawnnotes: string;
}

interface MobBrowserProps {
  mobs: Mob[]
  loading: boolean
  onRefresh: () => Promise<void>
  onMobAdded: () => void
}

export function MobBrowser({ mobs: initialMobs, loading: initialLoading }: MobBrowserProps) {
  const [mobs, setMobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMob, setSelectedMob] = useState<Mob | null>(null)

  useEffect(() => {
    fetchMobs()
  }, [])

  const fetchMobs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/mobs")
      const data = await response.json()
      setMobs(data.mobs || [])
    } catch (err) {
      console.error("Failed to fetch mobs:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (mobID: number) => {
    if (!confirm("Are you sure you want to delete this enemy?")) return

    try {
      const response = await fetch(`/api/mobs/${mobID}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMobs(mobs.filter((m) => m.mobID !== mobID))
      }
    } catch (err) {
      console.error("Failed to delete mob:", err)
    }
  }

  const filteredMobs = mobs.filter((m) => 
    (m.mobname || "").toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-lg text-muted-foreground">Loading enemies...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Enemies</h1>
        <Button onClick={fetchMobs} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <RefreshCw size={20} className="mr-2" />
          Refresh
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Search enemies..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border-2 border-primary bg-background"
      />

      {filteredMobs.length === 0 ? (
        <Card className="border-2 border-primary bg-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "No enemies found matching your search." : "No enemies found."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMobs.map((mob) => (
            <Card key={mob.mobid} className="border-2 border-primary hover:border-accent transition-colors bg-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-primary">{mob.mobname}</CardTitle>
                    {mob.mobtype && (
                      <CardDescription className="text-muted-foreground">Type: {mob.mobtype}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(mob.mobid)}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{mob.description}</p>
                {mob.weakness && (
                  <p className="text-sm">
                    <span className="font-semibold">Weakness:</span> <span className="text-accent">{mob.weakness}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
