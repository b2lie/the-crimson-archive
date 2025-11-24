"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export function CharacterForm() {
  const [characters, setCharacters] = useState<any[]>([])
  const [formData, setFormData] = useState({
    characterName: "",
    backstory: "",
    description: "",
    englishVA: "",
    japaneseVA: "",
    motionCapture: "",
    spriteURL: "",
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

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        setError("Failed to add character")
        return
      }

      setSuccess("Character added successfully!")
      setFormData({
        characterName: "",
        backstory: "",
        description: "",
        englishVA: "",
        japaneseVA: "",
        motionCapture: "",
        spriteURL: "",
      })

      // Refresh characters list
      fetchCharacters()
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/characters")
      const data = await response.json()
      setCharacters(data.characters || [])
    } catch (err) {
      console.error("Failed to fetch characters:", err)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddCharacter} className="space-y-4 p-4 bg-primary/5 rounded border-2 border-primary">
        <h3 className="text-lg font-bold text-primary">Add Character</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Character Name *</label>
            <Input
              type="text"
              name="characterName"
              placeholder="Enter character name"
              value={formData.characterName}
              onChange={handleChange}
              required
              className="border-primary bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">English Voice Actor</label>
            <Input
              type="text"
              name="englishVA"
              placeholder="Voice actor name"
              value={formData.englishVA}
              onChange={handleChange}
              className="border-primary bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Japanese Voice Actor</label>
            <Input
              type="text"
              name="japaneseVA"
              placeholder="Japanese VA name"
              value={formData.japaneseVA}
              onChange={handleChange}
              className="border-primary bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Motion Capture Actor</label>
            <Input
              type="text"
              name="motionCapture"
              placeholder="Motion capture name"
              value={formData.motionCapture}
              onChange={handleChange}
              className="border-primary bg-background"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Backstory</label>
          <textarea
            name="backstory"
            placeholder="Character backstory"
            value={formData.backstory}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
          <textarea
            name="description"
            placeholder="Character description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Sprite URL</label>
          <Input
            type="url"
            name="spriteURL"
            placeholder="https://example.com/sprite.png"
            value={formData.spriteURL}
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
          {loading ? "Adding..." : "Add Character"}
        </Button>
      </form>
    </div>
  )
}
