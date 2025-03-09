"use client"

import { useState } from "react"
import { Save, FolderOpen, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export interface SavedRequest {
  id: string
  name: string
  url: string
  method: string
  headers: { key: string; value: string }[]
  body: string
  bearerToken?: string
}

interface RequestManagerProps {
  onLoadRequest: (request: SavedRequest) => void
  currentRequest: Partial<SavedRequest>
}

export function RequestManager({ onLoadRequest, currentRequest }: RequestManagerProps) {
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savedRequests")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [newRequestName, setNewRequestName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const saveRequest = () => {
    if (!newRequestName.trim() || !currentRequest.url) return

    const newRequest: SavedRequest = {
      id: Date.now().toString(),
      name: newRequestName,
      url: currentRequest.url,
      method: currentRequest.method || "GET",
      headers: currentRequest.headers || [],
      body: currentRequest.body || "",
      bearerToken: currentRequest.bearerToken,
    }

    const updatedRequests = [...savedRequests, newRequest]
    setSavedRequests(updatedRequests)
    localStorage.setItem("savedRequests", JSON.stringify(updatedRequests))
    setNewRequestName("")
    setIsDialogOpen(false)
  }

  const deleteRequest = (id: string) => {
    const updatedRequests = savedRequests.filter((req) => req.id !== id)
    setSavedRequests(updatedRequests)
    localStorage.setItem("savedRequests", JSON.stringify(updatedRequests))
  }

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Current Request
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Request name"
                value={newRequestName}
                onChange={(e) => setNewRequestName(e.target.value)}
              />
              <Button onClick={saveRequest}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Saved Requests</h3>
          <Badge variant="outline" className="text-xs">
            {savedRequests.length} requests
          </Badge>
        </div>
        <ScrollArea className="h-[200px] rounded-md border p-2">
          {savedRequests.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">No saved requests yet</div>
          ) : (
            <div className="space-y-2">
              {savedRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted group">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{request.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {request.method}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onLoadRequest(request)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRequest(request.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

