"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface Map {
  mapid: number
  mapname: string
  floorname?: string
  description?: string
  mapurl?: string
}

interface MapEditModalProps {
  map: Map
  onClose: () => void
  onSave: () => void
}

export function MapEditModal({ map, onClose, onSave }: MapEditModalProps) {
  const [formData, setFormData] = useState<Map>(map)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // DIAGNOSTIC: Log the initial map data when the modal mounts
  // This helps verify that the parent component passed the correct ID.
  console.log("MapEditModal mounted with map prop:", map);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const id = map.mapid

    // CRITICAL CLIENT-SIDE CHECK: Ensure ID is valid before fetching
    // This prevents sending requests to "/api/maps/undefined" or "/api/maps/NaN"
    if (typeof id !== 'number' || isNaN(id) || id <= 0) {
      const errorMessage = `Error: Invalid map ID provided to the modal. ID: ${id}`;
      console.error(errorMessage, map);
      setError(errorMessage);
      setLoading(false);
      return;
    }

    // Prepare payload: filter out mapid (it's in the URL)
    const { mapid, ...updatePayload } = formData

    try {
      // FIX: Explicitly convert numeric ID to string for URL construction
      const url = `/api/maps/${id.toString()}`
      console.log(`[PUT] Attempting to update map at URL: ${url}`);

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      })

      if (!response.ok) {
        // Try to parse server error message
        const errorData = await response.json().catch(() => ({}));
        const serverError = errorData.error || `Status ${response.status}: Failed to update map.`;
        
        console.error("Server update error:", serverError);
        setError(serverError);
        return
      }

      setSuccess("Map updated successfully!")
      // Close modal after a short delay on success
      setTimeout(() => {
        onSave()
      }, 1000)
    } catch (err: any) {
      console.error("An unhandled error occurred during update:", err)
      setError(err.message || "An error occurred. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-lg border-2 border-accent bg-card my-8">
        <CardHeader className="border-b-2 border-accent flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-primary">Edit Map</CardTitle>
            {/* TEMPORARY DEBUG LINE: Visible confirmation of ID */}
            <p className="text-xs text-muted-foreground">DEBUG ID: {map.mapid}</p>
            <CardDescription className="text-muted-foreground">
              {map.mapname}
            </CardDescription>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent/20 rounded">
            <X size={24} className="text-accent" />
          </button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Map Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Map Name</label>
              <Input
                type="text"
                name="mapname"
                value={formData.mapname}
                onChange={handleChange}
                className="border-primary bg-background"
                required
              />
            </div>

            {/* Floor Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Floor Name</label>
              <Input
                type="text"
                name="floorname"
                value={formData.floorname || ""}
                onChange={handleChange}
                className="border-primary bg-background"
                placeholder="e.g. 1st Floor, Basement"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border-2 border-primary rounded bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Map Image URL */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Map Image URL</label>
              <Input
                type="url"
                name="mapurl"
                value={formData.mapurl || ""}
                onChange={handleChange}
                className="border-primary bg-background"
              />
            </div>

            {/* Error / Success Messages */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500 text-red-500 rounded text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-900/20 border border-green-500 text-green-500 rounded text-sm">
                {success}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
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
                disabled={loading}
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