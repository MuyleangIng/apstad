"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function JsonEditor({ value, onChange, className }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null)
  const [formattedValue, setFormattedValue] = useState(value)

  useEffect(() => {
    try {
      // Parse the JSON to check for validity
      if (value.trim()) {
        const parsed = JSON.parse(value)
        // Format with proper indentation
        const formatted = JSON.stringify(parsed, null, 2)
        setFormattedValue(formatted)
        setError(null)
      } else {
        setFormattedValue("")
        setError(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }, [value])

  const handleChange = (newValue: string) => {
    setFormattedValue(newValue)
    onChange(newValue)

    try {
      if (newValue.trim()) {
        JSON.parse(newValue)
        setError(null)
      } else {
        setError(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  // Helper function to detect if a string might be a number
  const detectNumberStrings = (text: string) => {
    const lines = text.split("\n")
    return lines
      .map((line) => {
        // Match potential number values in JSON
        return line.replace(/:\s*"(\d+(\.\d+)?)"/, (match, num) => {
          // Check if it's a valid number
          const parsed = Number.parseFloat(num)
          if (!isNaN(parsed)) {
            // Replace the quoted number with an actual number
            return `: ${num}`
          }
          return match
        })
      })
      .join("\n")
  }

  const formatJson = () => {
    try {
      if (formattedValue.trim()) {
        // First convert potential number strings to actual numbers
        const withNumbers = detectNumberStrings(formattedValue)
        // Then parse and format the JSON
        const parsed = JSON.parse(withNumbers)
        const formatted = JSON.stringify(parsed, null, 2)
        setFormattedValue(formatted)
        onChange(formatted)
        setError(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Badge variant={error ? "destructive" : "outline"} className="text-xs">
          {error ? "Invalid JSON" : "JSON"}
        </Badge>
        <button onClick={formatJson} className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Format
        </button>
      </div>
      <Textarea
        value={formattedValue}
        onChange={(e) => handleChange(e.target.value)}
        className={`font-mono ${className}`}
        placeholder="Enter JSON data"
        spellCheck={false}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

