"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CharacterForm } from "./character-form"
import { MapForm } from "./map-form"
import { MobForm } from "./mob-form"
// import { StoryArcForm } from "./story-arc-form"

interface AddGameFormProps {
  onGameAdded: () => void
}

export function AddGameForm({ onGameAdded }: AddGameFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    plotSummary: "",
    releaseDate: "",
    gameCoverURL: "",
    gameLogoURL: "",
    multiplayerSupport: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("game")

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
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to add game")
        return
      }

      setSuccess("Game added successfully!")
      setFormData({
        title: "",
        plotSummary: "",
        releaseDate: "",
        gameCoverURL: "",
        gameLogoURL: "",
        multiplayerSupport: false,
      })

      setTimeout(() => {
        onGameAdded()
      }, 1500)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-primary bg-card">
        <CardHeader className="border-b-2 border-primary">
          <CardTitle className="text-2xl text-primary">Game Database Management</CardTitle>
          <CardDescription>Add and manage game data and related entities</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-primary/10 border-2 border-primary">
              <TabsTrigger
                value="game"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Game
              </TabsTrigger>
              <TabsTrigger
                value="characters"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Characters
              </TabsTrigger>
              <TabsTrigger
                value="maps"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Maps
              </TabsTrigger>
              <TabsTrigger
                value="mobs"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Enemies
              </TabsTrigger>
              <TabsTrigger
                value="storyarcs"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Story Arcs
              </TabsTrigger>
            </TabsList>

            {/* Game Tab */}
            <TabsContent value="game" className="space-y-4 mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Game Title *</label>
                  <Input
                    type="text"
                    name="title"
                    placeholder="Enter game title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="border-primary bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Release Date *</label>
                  <Input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleChange}
                    required
                    className="border-primary bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Plot Summary</label>
                  <textarea
                    name="plotSummary"
                    placeholder="Enter plot summary"
                    value={formData.plotSummary}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Cover Image URL</label>
                  <Input
                    type="url"
                    name="gameCoverURL"
                    placeholder="https://example.com/cover.jpg"
                    value={formData.gameCoverURL}
                    onChange={handleChange}
                    className="border-primary bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Logo Image URL</label>
                  <Input
                    type="url"
                    name="gameLogoURL"
                    placeholder="https://example.com/logo.jpg"
                    value={formData.gameLogoURL}
                    onChange={handleChange}
                    className="border-primary bg-background"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="multiplayerSupport"
                    name="multiplayerSupport"
                    checked={formData.multiplayerSupport}
                    onChange={handleChange}
                    className="rounded border-primary"
                  />
                  <label htmlFor="multiplayerSupport" className="text-sm text-foreground">
                    Multiplayer Support
                  </label>
                </div>

                {error && <div className="p-3 bg-accent/10 border border-accent text-accent rounded">{error}</div>}

                {success && <div className="p-3 bg-accent/10 border border-accent text-accent rounded">{success}</div>}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary"
                >
                  {loading ? "Adding..." : "Add Game"}
                </Button>
              </form>
            </TabsContent>

            {/* Characters Tab */}
            <TabsContent value="characters" className="mt-4">
              <CharacterForm />
            </TabsContent>

            {/* Maps Tab */}
            <TabsContent value="maps" className="mt-4">
              <MapForm />
            </TabsContent>

            {/* Mobs Tab */}
            <TabsContent value="mobs" className="mt-4">
              <MobForm />
            </TabsContent>

            {/* Story Arcs Tab */}
            {/* <TabsContent value="storyarcs" className="mt-4">
              <StoryArcForm />
            </TabsContent> */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
