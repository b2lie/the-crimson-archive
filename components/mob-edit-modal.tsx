"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  const [form, setForm] = useState<Mob>(mob)

  const handleUpdate = async () => {
    const response = await fetch(`/api/mobs/${form.mobid}`, {
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
          <CardTitle className="text-primary">Edit Mob</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={form.mobname}
            onChange={(e) => setForm({ ...form, mobname: e.target.value })}
            placeholder="Map name"
          />
          <Input
            value={form.mobtype || ""}
            onChange={(e) => setForm({ ...form, mobtype: e.target.value })}
            placeholder="Mob type"
          />
          <Input
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
          />
          <Input
            value={form.weakness || ""}
            onChange={(e) => setForm({ ...form, weakness: e.target.value })}
            placeholder="Weakness"
          />
          <Input
            value={form.mobspriteurl || ""}
            onChange={(e) => setForm({ ...form, mobspriteurl: e.target.value })}
            placeholder="Mob sprite URL"
          />
          <Input
            value={form.spawnnotes || ""}
            onChange={(e) => setForm({ ...form, spawnnotes: e.target.value })}
            placeholder="Spawn notes"
          />
          <Input
            value={form.spawnnotes || ""}
            onChange={(e) => setForm({ ...form, spawnnotes: e.target.value })}
            placeholder="Spawn notes"
          />

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