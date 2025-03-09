"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Copy, Check } from "lucide-react"

interface AuthHeaderProps {
  value: string
  onChange: (value: string) => void
}

export function AuthHeader({ value, onChange }: AuthHeaderProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`Bearer ${value}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="bearer-token">Bearer Token</Label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            id="bearer-token"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-8"
            placeholder="Enter your bearer token"
          />
          <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Button variant="outline" size="icon" onClick={copyToClipboard} className="flex-shrink-0">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

