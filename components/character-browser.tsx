"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Edit2, Trash2, Plus } from "lucide-react"
import { CharacterEditModal } from "./character-edit-modal"

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

interface CharacterBrowserProps {
  characters: Character[]
  loading: boolean
  onRefresh: () => Promise<void>
  onCharacterAdded: () => void
}

export function CharacterBrowser({ characters: initialCharacters, loading: initialLoading, onRefresh, onCharacterAdded }: CharacterBrowserProps) {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters || [])
  const [loading, setLoading] = useState(initialLoading)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/characters")
      const data = await response.json()
      setCharacters(data.characters || [])
    } catch (err) {
      console.error("Failed to fetch characters:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (characterID: number) => {
    if (!confirm("Are you sure you want to delete this character?")) return

    try {
      const response = await fetch(`/api/characters/${characterID}`, { method: "DELETE" })
      if (response.ok) {
        setCharacters(characters.filter((c) => c.characterid !== characterID))
      }
    } catch (err) {
      console.error("Failed to delete character:", err)
    }
  }

  const filteredCharacters = characters.filter(c =>
    (c.charactername || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-lg text-muted-foreground">Loading characters...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Characters</h1>
        <div className="flex gap-2">
          <Button onClick={fetchCharacters} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <RefreshCw size={20} className="mr-2" /> Refresh
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary"
          >
            <Plus size={20} className="mr-2" /> Add Character
          </Button>
        </div>
      </div>

      {/* Add Form Placeholder */}
      {showAddForm && (
        <Card className="border-2 border-accent bg-card">
          <CardHeader>
            <CardTitle className="text-accent">Add New Character</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">Use the Add Game form to add characters</div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Search characters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-2 border-primary bg-background"
        />
      </div>

      {/* Character Grid */}
      {filteredCharacters.length === 0 ? (
        <Card className="border-2 border-primary bg-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "No characters found matching your search." : "No characters found."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharacters.map((character) => (
            <Card
              key={character.characterid}
              className="border-2 border-primary hover:border-accent transition-colors bg-card cursor-pointer"
              onClick={() => setSelectedCharacter(character)}
            >
              {character.spriteurl && (
                <div className="w-full h-48 bg-muted overflow-hidden rounded-t">
                  <img
                    src={character.spriteurl || "/placeholder.svg"}
                    alt={character.charactername}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-primary">{character.charactername}</CardTitle>
                {(character.englishva || character.japaneseva) && (
                  <CardDescription className="text-muted-foreground">
                    VA: {character.englishva || character.japaneseva}
                  </CardDescription>
                )}
                {(character.motioncapture) && (
                  <CardDescription className="text-muted-foreground">
                    Motion Capture Actor: {character.motioncapture}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{character.backstory}</p>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCharacter(character)
                    }}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Edit2 size={16} className="mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(character.characterid)
                    }}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Trash2 size={16} className="mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedCharacter && (
        <CharacterEditModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onSave={() => {
            fetchCharacters()
            setSelectedCharacter(null)
          }}
        />
      )}
    </div>
  )
}