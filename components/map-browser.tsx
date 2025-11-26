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
    // If initialMaps is provided and not empty, use it initially
    if (initialMaps && initialMaps.length > 0) {
      setMaps(initialMaps);
      setLoading(initialLoading);
    } else {
      // Otherwise, fetch maps on mount
      fetchMaps()
    }
  }, [initialMaps, initialLoading])

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
    // IMPORTANT: Replace native confirm with a custom modal UI in a production app/canvas environment.
    if (!window.confirm("WARNING: Are you sure you want to permanently delete this map?")) return

    try {
      const response = await fetch(`/api/maps/${mapID}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setMaps(maps.filter((m) => m.mapid !== mapID))
      } else {
        // Handle non-2xx responses from the API
        const errorData = await response.json();
        console.error("API delete failed:", errorData.error);
      }
    } catch (err) {
      console.error("Failed to delete map:", err)
    }
  }

  // 1. SORT MAPS BY ID (Ascending)
  const sortedMaps = [...maps].sort((a, b) => a.mapid - b.mapid);

  // 2. FILTER THE SORTED LIST
  const filteredMaps = sortedMaps.filter((m) =>
    (m.mapname || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 text-white bg-gray-900 p-8 rounded-xl">
        <p className="text-lg text-red-500 animate-pulse">Loading maps...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 bg-black min-h-screen">
      <div className="flex justify-between items-center pb-4 border-b border-red-700">
        <h1 className="text-4xl font-extrabold text-red-500">Map Registry</h1>
        <Button
          onClick={fetchMaps}
          className="bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-500/50"
          title="Refresh Map List"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Search maps by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-500"
      />

      {filteredMaps.length === 0 ? (
        <Card className="border-2 border-red-600 bg-gray-900">
          <CardContent className="pt-6 text-center text-white">
            <p className="text-gray-500">
              {searchTerm ? "No maps found matching your search criteria." : "No maps available yet. Start by adding one!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaps.map((map) => (
            <Card key={map.mapid} className="border-2 border-gray-700 hover:border-red-500 transition-colors bg-gray-900 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-red-400">
                      {map.mapname}
                    </CardTitle>
                    {map.floorname && (
                      <CardDescription className="text-gray-500 mt-1">Floor: {map.floorname}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedMap(map)}
                      className="bg-gray-700 text-red-400 hover:bg-gray-600 p-2"
                      title="Edit Map"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(map.mapid)}
                      className="bg-red-700 text-white hover:bg-red-800 p-2"
                      title="Delete Map"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">{map.description || "No description provided."}</p>
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