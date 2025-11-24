"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export function MobForm() {
  const [formData, setFormData] = useState({
    mobName: "",
    mobType: "",
    description: "",
    weakness: "",
    mobSpriteURL: "",
    spawnNotes: "",
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
      const response = await fetch("/api/mobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        setError("Failed to add enemy")
        return
      }

      setSuccess("Enemy added successfully!")
      setFormData({
        mobName: "",
        mobType: "",
        description: "",
        weakness: "",
        mobSpriteURL: "",
        spawnNotes: "",
      })
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-primary/5 rounded border-2 border-primary">
      <h3 className="text-lg font-bold text-primary">Add Enemy</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Enemy Name *</label>
          <Input
            type="text"
            name="mobName"
            placeholder="Enter enemy name"
            value={formData.mobName}
            onChange={handleChange}
            required
            className="border-primary bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Enemy Type (e.g. Boss, Regular, Mini-boss)
          </label>
          <Input
            type="text"
            name="mobType"
            placeholder="Enemy classification"
            value={formData.mobType}
            onChange={handleChange}
            className="border-primary bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Weakness</label>
          <Input
            type="text"
            name="weakness"
            placeholder="Element or weakness"
            value={formData.weakness}
            onChange={handleChange}
            className="border-primary bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Sprite URL</label>
          <Input
            type="url"
            name="mobSpriteURL"
            placeholder="https://example.com/sprite.png"
            value={formData.mobSpriteURL}
            onChange={handleChange}
            className="border-primary bg-background"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
        <textarea
          name="description"
          placeholder="Enemy description and abilities"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Spawn Notes</label>
        <textarea
          name="spawnNotes"
          placeholder="Where and when this enemy spawns"
          value={formData.spawnNotes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground"
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
        {loading ? "Adding..." : "Add Enemy"}
      </Button>
    </form>
  )
}
