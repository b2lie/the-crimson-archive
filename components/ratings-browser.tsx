"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Edit2, Trash2, Star, User } from "lucide-react"
import { RatingEditModal } from "./rating-edit-modal"
import { GameDetailModal } from "./game-detail-modal"
import { RatingForm } from "./rating-form"

// FIX: Updated interface to match API response structure (e.g., 'games' instead of 'game')
interface Rating {
    ratingid: number
    rating?: number
    review?: string
    reviewtimestamp?: string
    personalbest?: string

    // CRITICAL FIX: The nested object key must match the table name used in the API join.
    games: { // Assuming your games table is aliased/referenced as 'games'
        gameid: number // Assuming 'id' is the primary key of the games table
        title: string
    }
    users?: { // Optional user data
        username?: string
        // Add other user fields if needed
    }
}

export function RatingsBrowser() {
    const [ratings, setRatings] = useState<Rating[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [addOpen, setAddOpen] = useState(false)
    const [selectedRating, setSelectedRating] = useState<Rating | null>(null)
    const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
    const [deletionConfirmed, setDeletionConfirmed] = useState(false) // Custom confirmation state

    useEffect(() => {
        fetchRatings()
    }, [])

    const fetchRatings = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/ratings")
            const data = await res.json()
            setRatings(data.ratings || [])
        } catch (err) {
            console.error("failed to fetch ratings:", err)
        } finally {
            setLoading(false)
        }
    }

    // Replaced window.confirm
    const handleDelete = async (ratingId: number) => {
        if (!deletionConfirmed) {
            // In a real app, this would open a custom modal for confirmation
            console.warn("Please confirm deletion by clicking the trash icon again.")
            setDeletionConfirmed(true);
            return;
        }

        try {
            const res = await fetch(`/api/ratings/${ratingId}`, { method: "DELETE" })
            if (res.ok) {
                setRatings((prev) => prev.filter((r) => r.ratingid !== ratingId))
            } else {
                console.error("failed to delete rating:", await res.json());
            }
        } catch (err) {
            console.error("failed to delete rating:", err)
        } finally {
            setDeletionConfirmed(false);
        }
    }

    const filteredRatings = ratings
        .sort((a, b) => (b.ratingid || 0) - (a.ratingid || 0))
        .filter((r) =>
            // CRITICAL FIX: Access 'games.title' instead of 'game.title'
            (r.games?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
        )

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center pb-4 border-b">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    ratings <Star size={20} className="text-yellow-400" />
                </h1>
                <div className="flex gap-2">
                    <Button onClick={() => setAddOpen(true)}>add rating</Button>
                    <Button onClick={fetchRatings} disabled={loading}>
                        <RefreshCw className={loading ? "animate-spin mr-2" : "mr-2"} size={16} />
                        refresh
                    </Button>
                </div>

                {addOpen && (
                    <div className="p-4 mt-4 border-2 border-primary rounded bg-primary/5">
                        <RatingForm
                            onSave={() => {
                                fetchRatings()
                                setAddOpen(false)
                            }}
                        />
                        <Button
                            onClick={() => setAddOpen(false)}
                            className="mt-2 w-full bg-accent text-accent-foreground border-2 border-accent hover:bg-accent/90"
                        >
                            cancel
                        </Button>
                    </div>
                )}

            </div>

            <Input
                placeholder="search ratings by game name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredRatings.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        no ratings found.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRatings.map((rating) => (
                        <Card key={rating.ratingid} className="transition hover:shadow-md">
                            <CardHeader className="flex flex-col gap-1">
                                {/* CRITICAL FIX: Access 'games.title' */}
                                <CardTitle>{rating.games?.title || "Unknown Game"}</CardTitle>
                                <CardDescription className="flex items-center text-sm text-gray-500">
                                    <User size={14} className="mr-1" />
                                    By: {rating.users?.username || 'Anonymous'}
                                </CardDescription>
                                <CardDescription className="font-semibold text-yellow-500">
                                    {rating.rating}/5
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {rating.review || "no review written"}
                                </p>
                                <div className="flex justify-between pt-2">
                                    <Button size="sm" variant="outline" onClick={() => setSelectedRating(rating)}>
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => setSelectedGameId(rating.games?.gameid || null)}>
                                        details
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={deletionConfirmed ? "destructive" : "outline"}
                                        onClick={() => handleDelete(rating.ratingid)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedRating && (
                <RatingEditModal
                    rating={selectedRating}
                    onClose={() => setSelectedRating(null)}
                    onSave={() => {
                        fetchRatings()
                        setSelectedRating(null)
                    }}
                />
            )}

            {selectedGameId !== null && (
                <GameDetailModal
                    gameId={selectedGameId}
                    onClose={() => setSelectedGameId(null)}
                />
            )}
        </div>
    )
}