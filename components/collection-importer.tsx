"use client"

import type React from "react"

import { useState } from "react"
import { FileJson, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import type { CollectionType } from "@/types/collection"

interface CollectionImporterProps {
  onImport: (collection: CollectionType) => void
}

export function CollectionImporter({ onImport }: CollectionImporterProps) {
  const [importing, setImporting] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const collection = JSON.parse(content) as CollectionType

        if (!collection.info || !collection.item) {
          throw new Error("Invalid collection format")
        }

        onImport(collection)
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file is not a valid Postman collection",
          variant: "destructive",
        })
      } finally {
        setImporting(false)
      }
    }

    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Failed to read the file",
        variant: "destructive",
      })
      setImporting(false)
    }

    reader.readAsText(file)
  }

  const handlePasteCollection = () => {
    const pastedText = prompt("Paste your Postman collection JSON here:")
    if (!pastedText) return

    try {
      const collection = JSON.parse(pastedText) as CollectionType

      if (!collection.info || !collection.item) {
        throw new Error("Invalid collection format")
      }

      onImport(collection)
    } catch (error) {
      toast({
        title: "Import failed",
        description: "The pasted content is not a valid Postman collection",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <Button variant="outline" className="w-full" onClick={() => document.getElementById("file-upload")?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Import Collection
        </Button>
        <input
          id="file-upload"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileUpload}
          disabled={importing}
        />
        <Button variant="outline" className="w-full" onClick={handlePasteCollection}>
          <FileJson className="mr-2 h-4 w-4" />
          Paste Collection
        </Button>
      </div>
    </div>
  )
}

