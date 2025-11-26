"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface RatingEditModalProps {
  rating: any
  onClose: () => void
  onSave: () => void
}

export function RatingEditModal({ rating, onClose, onSave }: RatingEditModalProps) {
  const [formData, setFormData] = useState({
    rating: rating.rating || "",
    review: rating.review || "",
    personalbest: rating.personalbest || ""
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
      const res = await fetch(`/api/ratings/${rating.ratingid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: Number(formData.rating),
          review: formData.review,
          personalbest: formData.personalbest,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || "failed to update rating")
        return
      }

      setSuccess("rating updated!")
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
            <CardTitle className="text-2xl">Edit Rating</CardTitle>
            <CardDescription>{rating.game?.title}</CardDescription>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-primary/10 rounded">
            <X size={24} />
          </button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm mb-1">Rating (1 – 5)</label>
              <Input
                type="number"
                required
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min={1}
                max={10}
              />
            </div>

            {/* Review */}
            <div>
              <label className="block text-sm mb-1">Review</label>
              <textarea
                name="review"
                value={formData.review}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded bg-background"
                placeholder="write a review..."
              />
            </div>

            {/* Personal Best */}
            <div>
              <label className="block text-sm mb-1">Personal Best (optional)</label>
              <Input
                name="personalbest"
                value={formData.personalbest}
                onChange={handleChange}
                placeholder="A, S+, etc"
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