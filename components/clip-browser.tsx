"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Edit2, Trash2, FileVideo } from "lucide-react"
import { ClipForm } from "./clip-form"
import { ClipEditModal } from "./clip-edit-modal" 

interface ClipBrowserProps {
    clips?: any[]
    loading?: boolean
    onRefresh?: () => void
    onAddClip?: () => void
}

interface Clip {
    clipid: number
    cliptitle: string
    clipurl: string
    mediatype?: string
    gameid: number
    games?: { title: string } // optional, join from API
}

/**
 * Helper component to render either a YouTube iframe or a standard HTML5 video tag.
 */
const ClipVideoPlayer = ({ url, type }: { url: string, type?: string }) => {
    // Regex to find the video ID from common YouTube URL formats
    const youTubeIdMatch = url.match(/(?:youtu\.be\/|v=|embed\/|watch\?v=)([^&]+)/);
    const isYouTube = !!youTubeIdMatch;
    const videoId = youTubeIdMatch ? youTubeIdMatch[1] : null;

    if (isYouTube && videoId) {
        // Use an iframe for YouTube embeds
        return (
            <div className="relative w-full aspect-video">
                <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-md"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded YouTube Clip"
                    frameBorder="0"
                />
            </div>
        );
    }

    // Use the native HTML5 video tag for direct video files (MP4, WEBM, etc.)
    return (
        <video
            src={url}
            controls
            className="w-full rounded-md max-h-96 bg-black"
            {...(type && type !== 'unknown' && { type: type })}
        >
            <p className="text-red-400 p-4">Your browser does not support the video tag or the clip URL is invalid.</p>
        </video>
    );
};


export function ClipBrowser({ clips: initialClips, loading: initialLoading, onRefresh, onAddClip }: ClipBrowserProps) {
    const [clips, setClips] = useState<Clip[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [addOpen, setAddOpen] = useState(false) // Controls visibility of the Add Clip Form
    const [selectedClip, setSelectedClip] = useState<Clip | null>(null) // Controls visibility and content of the Edit Modal

    useEffect(() => {
        fetchClips()
    }, [])

    const fetchClips = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/clips")
            const data = await res.json()
            setClips(data.clips || [])
        } catch (err) {
            console.error("failed to fetch clips:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (clipID: number) => {
        if (!window.confirm("Are you sure you want to delete this clip?")) return
        try {
            const res = await fetch(`/api/clips/${clipID}`, { method: "DELETE" })
            if (res.ok) setClips((prev) => prev.filter((c) => c.clipid !== clipID))
        } catch (err) {
            console.error("failed to delete clip:", err)
        }
    }

    const filteredClips = clips
        .sort((a, b) => b.clipid - a.clipid)
        .filter((c) =>
            (c.cliptitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.games?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
        )

    return (
        <div className="space-y-8 p-6">
            {/* Header + add/refresh buttons */}
            <div className="flex justify-between items-center pb-4 border-b">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    clips <FileVideo size={20} className="text-blue-500" />
                </h1>
                <div className="flex gap-2">
                    <Button onClick={() => setAddOpen(true)}>
                        <FileVideo size={16} className="mr-2" /> add clip
                    </Button>
                    <Button onClick={fetchClips} disabled={loading}>
                        <RefreshCw className={loading ? "animate-spin mr-2" : "mr-2"} size={16} />
                        refresh
                    </Button>
                </div>
            </div>

            <Input
                placeholder="search clips by title or game..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
            />

            {addOpen && (
                <div className="p-4 mt-4 border-2 border-primary rounded bg-primary/5">
                    <ClipForm
                        onSave={() => {
                            fetchClips()
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

            <hr className="my-4" />

            {filteredClips.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        No clips found.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClips.map((clip, index) => (
                        <Card key={index} className="transition hover:shadow-md">
                            <CardHeader className="flex flex-col gap-1">
                                <CardTitle>{clip.cliptitle}</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Game: {clip.games?.title || clip.gameid}
                                </CardDescription>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Type: {clip.mediatype || "unknown"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">

                                {/* Video Player */}
                                <ClipVideoPlayer
                                    url={clip.clipurl}
                                    type={clip.mediatype}
                                />

                                <div className="flex justify-between pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedClip(clip)} // Sets clip for the Edit Modal
                                    >
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(clip.clipid)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedClip && (
                <ClipEditModal
                    clip={selectedClip}
                    onClose={() => setSelectedClip(null)}
                    onSave={() => {
                        fetchClips()
                        setSelectedClip(null)
                    }}
                />
            )}
        </div>
    )
}