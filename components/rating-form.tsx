"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface RatingFormProps {
    onSave?: () => void
}

export function RatingForm({ onSave }: RatingFormProps) {
    const [formData, setFormData] = useState({
        rating: "",
        review: "",
        personalbest: "",
        gameId: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        // Validate that gameId and rating are not just empty strings from the form
        if (!formData.rating || !formData.gameId) {
            setError("Rating and Game ID are required.")
            setLoading(false)
            return
        }

        try {
            const res = await fetch("/api/ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                // FIX: Including credentials to send Supabase session cookies
                credentials: "include",
            })


            if (res.status === 401) {
                console.error('Submission failed: User is not authenticated.');
                return;
            }

            // Check for specific error message from the API response body
            if (!res.ok) {
                let errorMessage = "Failed to add rating";
                try {
                    const errorData = await res.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // Ignore JSON parsing error if response is not JSON
                }
                throw new Error(errorMessage)
            }

            setSuccess("Rating added!")
            setFormData({ rating: "", review: "", personalbest: "", gameId: "" })
            onSave?.()
        } catch (err: any) {
            setError(err.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-primary/5">
            <Input
                type="number"
                name="rating"
                placeholder="stars (1 - 5)"
                value={formData.rating}
                onChange={handleChange}
                required
            />
            <Input
                type="text"
                name="review"
                placeholder="leave a review!"
                value={formData.review}
                onChange={handleChange}
            />
            <Input
                type="text"
                name="personalbest"
                placeholder="personal best (S+, S, A, etc.)"
                value={formData.personalbest}
                onChange={handleChange}
            />
            <Input
                type="number"
                name="gameId"
                placeholder="game ID"
                value={formData.gameId}
                onChange={handleChange}
                required
            />

            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
                <Plus size={16} />
                {loading ? "Adding..." : "Add Rating"}
            </Button>
        </form>
    )
}