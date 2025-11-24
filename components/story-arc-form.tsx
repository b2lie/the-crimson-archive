"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export function StoryArcForm() {
  const [formData, setFormData] = useState({
    arcTitle: "",
    arcOrder: "",
    summary: "",
    description: "",
    isMainArc: false,
    parentArcID: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/story-arcs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        setError("Failed to add story arc")
        return
      }

      setSuccess("Story arc added successfully!")
      setFormData({
        arcTitle: "",
        arcOrder: "",
        summary: "",
        description: "",
        isMainArc: false,
        parentArcID: "",
      })
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-primary/5 rounded border-2 border-primary">
      <h3 className="text-lg font-bold text-primary">Add Story Arc</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Arc Title *</label>
          <Input
            type="text"
            name="arcTitle"
            placeholder="Enter arc title"
            value={formData.arcTitle}
            onChange={handleChange}
            required
            className="border-primary bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Arc Order (e.g. 1.0, 1.1, 2.3)</label>
          <Input
            type="text"
            name="arcOrder"
            placeholder="Arc sequence number"
            value={formData.arcOrder}
            onChange={handleChange}
            className="border-primary bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Parent Arc ID (for sub-arcs)</label>
          <Input
            type="number"
            name="parentArcID"
            placeholder="Parent arc ID"
            value={formData.parentArcID}
            onChange={handleChange}
            className="border-primary bg-background"
          />
        </div>

        <div className="flex items-center gap-2 pt-8">
          <input
            type="checkbox"
            id="isMainArc"
            name="isMainArc"
            checked={formData.isMainArc}
            onChange={handleChange}
            className="rounded border-primary"
          />
          <label htmlFor="isMainArc" className="text-sm text-foreground">
            Main Story Arc
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Summary</label>
        <textarea
          name="summary"
          placeholder="Brief arc summary"
          value={formData.summary}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Description *</label>
        <textarea
          name="description"
          placeholder="Detailed arc description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
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
        {loading ? "Adding..." : "Add Story Arc"}
      </Button>
    </form>
  )
}
