"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface ClipEditModalProps {
  clip: any
  onClose: () => void
  onSave: () => void
}

export function ClipEditModal({ clip, onClose, onSave }: ClipEditModalProps) {
  const [formData, setFormData] = useState({
    cliptitle: clip.cliptitle || "",
    clipurl: clip.clipurl || "",
    mediatype: clip.mediatype || ""
  })

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
      const res = await fetch(`/api/clips/${clip.clipid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            cliptitle: formData.cliptitle,
            clipurl: formData.clipurl,
            mediatype: formData.mediatype,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || "failed to update clip")
        return
      }

      setSuccess("clip updated!")
      setTimeout(() => onSave(), 800)
    } catch (err: any) {
      setError(err.message || "something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-lg border-2 border-primary bg-card my-8">
        <CardHeader className="border-b-2 border-primary flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Edit Clip</CardTitle>
            <CardDescription>{clip.games?.title}</CardDescription>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-primary/10 rounded">
            <X size={24} />
          </button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Clip Title */}
            <div>
              <label className="block text-sm mb-1">Clip Title</label>
              <Input
                type="text"
                required
                name="cliptitle"
                value={formData.cliptitle}
                onChange={handleChange}
              />
            </div>

            {/* Clip URL */}
            <div>
              <label className="block text-sm mb-1">Clip URL</label>
              <textarea
                name="clipurl"
                value={formData.clipurl}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded bg-background"
                placeholder="youtube, twitch, etc. (link)"
              />
            </div>

            {/* Media Type */}
            <div>
              <label className="block text-sm mb-1">Media Type (optional)</label>
              <Input
                name="mediatype"
                value={formData.mediatype}
                onChange={handleChange}
                placeholder="Trailer, Gameplay, etc."
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <div className="flex gap-2 pt-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "saving..." : "save"}
              </Button>
              <Button type="button" onClick={onClose} disabled={loading} variant="secondary" className="flex-1">
                cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}