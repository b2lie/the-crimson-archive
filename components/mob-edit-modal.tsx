"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface Mob {
  mobid: number
  mobname: string
  mobtype?: string
  description?: string
  weakness?: string
  mobspriteurl?: string
  spawnnotes?: string
}

interface MobEditModalProps {
  mob: Mob
  onClose: () => void
  onSave: () => void
}

export function MobEditModal({ mob, onClose, onSave }: MobEditModalProps) {
  const [formData, setFormData] = useState<Mob>(mob)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/mobs/${mob.mobid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        setError("Failed to update mob")
        return
      }

      setSuccess("Mob updated successfully!")
      setTimeout(() => {
        onSave()
      }, 1000)
    } catch {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-2 border-accent bg-card my-8">
        <CardHeader className="border-b-2 border-accent flex justify-between items-start">
          <CardTitle className="text-2xl text-primary">Edit Mob</CardTitle>
          <button onClick={onClose} className="p-1 hover:bg-accent/20 rounded">
            <X size={24} className="text-accent" />
          </button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Mob Name</label>
                <Input
                  type="text"
                  name="mobname"
                  value={formData.mobname}
                  onChange={handleChange}
                  className="border-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Mob Type</label>
                <Input
                  type="text"
                  name="mobtype"
                  value={formData.mobtype || ""}
                  onChange={handleChange}
                  className="border-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Weakness</label>
                <Input
                  type="text"
                  name="weakness"
                  value={formData.weakness || ""}
                  onChange={handleChange}
                  className="border-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Sprite URL</label>
                <Input
                  type="url"
                  name="mobspriteurl"
                  value={formData.mobspriteurl || ""}
                  onChange={handleChange}
                  className="border-primary bg-background"
                />
              </div>
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
              <label className="block text-sm font-medium mb-2 text-foreground">Spawn Notes</label>
              <textarea
                name="spawnnotes"
                value={formData.spawnnotes || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground"
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