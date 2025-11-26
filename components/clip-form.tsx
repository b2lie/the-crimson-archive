"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface ClipFormProps {
    onSave?: () => void
}

export function ClipForm({ onSave }: ClipFormProps) {
    const [formData, setFormData] = useState({
        cliptitle: "",
        clipurl: "",
        mediatype: "",
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

        // Validate that gameId and cliptitle are not just empty strings from the form
        if (!formData.cliptitle || !formData.gameId) {
            setError("Clip title and Game ID are required.")
            setLoading(false)
            return
        }

        try {
            const res = await fetch("/api/clips", {
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
                let errorMessage = "Failed to add clip";
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

            setSuccess("Clip added!")
            setFormData({ cliptitle: "", clipurl: "", mediatype: "", gameId: "" })
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
                type="text"
                name="cliptitle"
                placeholder="clip title"
                value={formData.cliptitle}
                onChange={handleChange}
                required
            />
            <Input
                type="text"
                name="clipurl"
                placeholder="youtube, twitch, etc."
                value={formData.clipurl}
                onChange={handleChange}
            />
            <Input
                type="text"
                name="mediatype"
                placeholder="trailer, gameplay, review, etc."
                value={formData.mediatype}
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
                {loading ? "Adding..." : "Add Clip"}
            </Button>
        </form>
    )
}