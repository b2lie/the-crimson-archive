"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Edit2, Trash2 } from "lucide-react"
import { MapEditModal } from "./map-edit-modal"

interface Map {
  mapid: number
  mapname: string
  floorname?: string
  description?: string
  mapurl?: string
}

interface MapBrowserProps {
  maps: Map[]
  loading: boolean
  onRefresh: () => Promise<void>
  onMapAdded: () => void
}

export function MapBrowser({ maps: initialMaps, loading: initialLoading }: MapBrowserProps) {
  const [maps, setMaps] = useState<Map[]>(initialMaps || [])
  const [loading, setLoading] = useState(initialLoading)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMap, setSelectedMap] = useState<Map | null>(null)

  useEffect(() => {
    fetchMaps()
  }, [])

  const fetchMaps = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/maps")
      const data = await response.json()
      setMaps(data.maps || [])
    } catch (err) {
      console.error("Failed to fetch maps:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (mapID: number) => {
    if (!confirm("Are you sure you want to delete this map?")) return

    try {
      const response = await fetch(`/api/maps/${mapID}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setMaps(maps.filter((m) => m.mapid !== mapID))
      }
    } catch (err) {
      console.error("Failed to delete map:", err)
    }
  }

  const filteredMaps = maps.filter((m) =>
    (m.mapname || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-lg text-muted-foreground">Loading maps...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Maps</h1>
        <Button onClick={fetchMaps} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <RefreshCw size={20} className="mr-2" />
          Refresh
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Search maps..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border-2 border-primary bg-background"
      />

      {filteredMaps.length === 0 ? (
        <Card className="border-2 border-primary bg-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "No maps found matching your search." : "No maps found."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredMaps.map((map) => (
            <Card key={map.mapid} className="border-2 border-primary hover:border-accent transition-colors bg-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-primary">{map.mapname}</CardTitle>
                    {map.floorname && (
                      <CardDescription className="text-muted-foreground">Floor: {map.floorname}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedMap(map)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(map.mapid)}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{map.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedMap && (
        <MapEditModal
          map={selectedMap}
          onClose={() => setSelectedMap(null)}
          onSave={() => {
            fetchMaps()
            setSelectedMap(null)
          }}
        />
      )}

    </div>
  )
}
