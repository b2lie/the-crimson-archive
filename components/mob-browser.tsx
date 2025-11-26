"use client"

import { useState, useEffect } from "react"
// Assuming these UI components are functional wrappers around simple HTML/Tailwind,
// since they were not provided, they are left as-is for compatibility.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Edit2, Trash2, SwordIcon } from "lucide-react"
import { MobEditModal } from "./mob-edit-modal" // Assumed path

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

// NOTE: The initialLoading and initialMobs props are ignored here to implement a self-contained fetch
//       logic within the component, which is standard for components that manage their own data flow.
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
      // Ensure data structure is handled correctly (either direct array or wrapper object)
      setMobs(data.mobs || data || [])
    } catch (err) {
      console.error("Failed to fetch mobs:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (mobID: number) => {
    // IMPORTANT: Avoid using window.confirm. Replacing with console log + early return for safety.
    // In a production app, this would be replaced by a custom modal dialog.
    console.warn("Delete functionality initiated. (Using custom modal is recommended over confirm())")

    // Basic confirmation simulation (requires user to manually review the mobID before action)
    const confirmation = window.prompt(`Are you sure you want to delete mob ID ${mobID}? Type 'DELETE' to confirm.`)
    if (confirmation !== 'DELETE') {
      return
    }

    try {
      const response = await fetch(`/api/mobs/${mobID}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Use mobid from the database schema for filtering
        setMobs(mobs.filter((m) => m.mobid !== mobID))
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API delete failed:", errorData.error || response.statusText);
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
        <h1 className="text-3xl font-bold text-primary">
          enemies <SwordIcon size={24} className="inline-block ml-2 text-orange-400" />
        </h1>
        <Button onClick={fetchMobs} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <RefreshCw size={20} className="mr-2" />
          refresh
        </Button>
      </div>

      <Input
        type="text"
        placeholder="search enemies by name..."
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
                  {/* BEGIN: Modified block to include sprite image */}
                  <div className="flex-1 space-y-2">
                    {/* Mob Sprite Image */}
                    {mob.mobspriteurl && (
                      <div className="w-32 h-32 p-1 rounded-lg bg-black-500 border-2 border-accent flex items-center justify-center overflow-hidden">
                        <img
                          src={mob.mobspriteurl}
                          alt={`${mob.mobname} sprite`}
                          className="object-contain max-w-full max-h-full"
                          // Fallback image in case the URL is broken
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/64x64/374151/ffffff?text=Mob'; }}
                        />
                      </div>
                    )}
                    {/* Title and Description */}
                    <CardTitle className="text-primary">{mob.mobname}</CardTitle>
                    {mob.mobtype && (
                      <CardDescription className="text-muted-foreground">Type: {mob.mobtype}</CardDescription>
                    )}
                  </div>
                  {/* END: Modified block */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedMob(mob)}
                      className="bg-gray-200 text-gray-800 hover:bg-primary/90"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(mob.mobid)}
                      className="bg-red-500 text-accent-foreground hover:bg-accent/90"
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

      {selectedMob && (
        <MobEditModal
          mob={selectedMob}
          onClose={() => setSelectedMob(null)}
          onSave={() => {
            fetchMobs()
            setSelectedMob(null)
          }}
        />
      )}
    </div>
  )
}