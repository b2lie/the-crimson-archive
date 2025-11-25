"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  const [form, setForm] = useState<Map>(map)

  const handleUpdate = async () => {
    const response = await fetch(`/api/maps/${form.mapid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (response.ok) {
      onSave()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <Card className="w-[500px] bg-card border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-primary">Edit Map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Map Name</label>
            <Input
              value={form.mapname}
              onChange={(e) => setForm({ ...form, mapname: e.target.value })}
              placeholder="Map name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Floor Name</label>
            <Input
              value={form.floorname || ""}
              onChange={(e) => setForm({ ...form, floorname: e.target.value })}
              placeholder="Floor name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Map Image URL</label>
            <Input
              value={form.mapurl || ""}
              onChange={(e) => setForm({ ...form, mapurl: e.target.value })}
              placeholder="Map image URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
            <Input
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={onClose} className="border-primary">
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground" onClick={handleUpdate}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}