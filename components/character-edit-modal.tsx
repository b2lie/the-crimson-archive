"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface Character {
  characterid: number
  charactername: string
  englishva?: string
  japaneseva?: string
  motioncapture?: string
  backstory?: string
  description?: string
  spriteurl?: string
}

interface CharacterEditModalProps {
  character: Character
  onClose: () => void
  onSave: () => void
}

export function CharacterEditModal({ character, onClose, onSave }: CharacterEditModalProps) {

  const [formData, setFormData] = useState<Character>(character)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  console.log("character prop:", character)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: Character) => ({
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
      const response = await fetch(`/api/characters/${character.characterid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        setError("Failed to update character")
        return
      }

      setSuccess("Character updated successfully!")
      setTimeout(() => {
        onSave()
      }, 1000)
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-2 border-accent bg-card my-8">
        <CardHeader className="border-b-2 border-accent flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-primary">Edit Character</CardTitle>
            <CardDescription className="text-muted-foreground">{character.charactername}</CardDescription>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent/20 rounded">
            <X size={24} className="text-accent" />
          </button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Character Name</label>
                <Input
                  type="text"
                  name="charactername"
                  value={formData.charactername}
                  onChange={handleChange}
                  className="border-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">English Voice Actor</label>
                <Input
                  type="text"
                  name="englishva"
                  value={formData.englishva || ""}
                  onChange={handleChange}
                  className="border-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Japanese Voice Actor</label>
                <Input
                  type="text"
                  name="japaneseva"
                  value={formData.japaneseva || ""}
                  onChange={handleChange}
                  className="border-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Motion Capture Actor</label>
                <Input
                  type="text"
                  name="motioncapture"
                  value={formData.motioncapture || ""}
                  onChange={handleChange}
                  className="border-primary bg-background"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Backstory</label>
              <textarea
                name="backstory"
                value={formData.backstory || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Sprite URL</label>
              <Input
                type="url"
                name="spriteurl"
                value={formData.spriteurl || ""}
                onChange={handleChange}
                className="border-primary bg-background"
              />
            </div>

            {error && <div className="p-3 bg-accent/10 border border-accent text-accent rounded">{error}</div>}

            {success && <div className="p-3 bg-accent/10 border border-accent text-accent rounded">{success}</div>}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-accent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}