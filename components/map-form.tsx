"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export function MapForm() {
  const [maps, setMaps] = useState<any[]>([])
  const [formData, setFormData] = useState({
    mapName: "",
    floorName: "",
    description: "",
    mapURL: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        setError("Failed to add map")
        return
      }

      setSuccess("Map added successfully!")
      setFormData({
        mapName: "",
        floorName: "",
        description: "",
        mapURL: "",
      })
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchMaps = async () => {
    try {
      const response = await fetch("/api/maps")
      const data = await response.json()
      setMaps(data.maps || [])
    } catch (err) {
      console.error("Failed to fetch maps:", err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-primary/5 rounded border-2 border-primary">
      <h3 className="text-lg font-bold text-primary">Add Map</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Map Name *</label>
          <Input
            type="text"
            name="mapName"
            placeholder="Enter map name"
            value={formData.mapName}
            onChange={handleChange}
            required
            className="border-primary bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Floor Name (e.g. 1F, 3B)</label>
          <Input
            type="text"
            name="floorName"
            placeholder="Floor designation"
            value={formData.floorName}
            onChange={handleChange}
            className="border-primary bg-background"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Description *</label>
        <textarea
          name="description"
          placeholder="Map description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Map Image URL</label>
        <Input
          type="url"
          name="mapURL"
          placeholder="https://example.com/map.png"
          value={formData.mapURL}
          onChange={handleChange}
          className="border-primary bg-background"
        />
      </div>

      {error && <div className="p-2 bg-accent/10 border border-accent text-accent rounded text-sm">{error}</div>}

      {success && <div className="p-2 bg-accent/10 border border-accent text-accent rounded text-sm">{success}</div>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-accent"
      >
        <Plus size={20} className="mr-2" />
        {loading ? "Adding..." : "Add Map"}
      </Button>
    </form>
  )
}
