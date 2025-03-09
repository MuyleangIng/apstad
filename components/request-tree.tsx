"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, FileText } from "lucide-react"
import type { CollectionType, RequestItem } from "@/app/types/collection"
import { Badge } from "@/components/ui/badge"

interface RequestTreeProps {
  collection: CollectionType
  onSelectRequest: (request: RequestItem) => void
}

export function RequestTree({ collection, onSelectRequest }: RequestTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  const renderItems = (items: RequestItem[], parentId = "") => {
    return (
      <ul className="pl-4 space-y-1">
        {items.map((item, index) => {
          const itemId = `${parentId}-${index}`
          const isFolder = !!item.item && item.item.length > 0
          const isExpanded = expandedFolders[itemId]

          return (
            <li key={itemId} className="py-1">
              {isFolder ? (
                <div>
                  <button
                    className="flex items-center text-sm hover:text-primary transition-colors w-full text-left"
                    onClick={() => toggleFolder(itemId)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </button>
                  {isExpanded && item.item && renderItems(item.item, itemId)}
                </div>
              ) : (
                <button
                  className="flex items-center text-sm hover:text-primary transition-colors pl-5 w-full text-left"
                  onClick={() => onSelectRequest(item)}
                >
                  <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{item.name}</span>
                  {item.request?.method && (
                    <Badge variant="outline" className={`ml-2 ${getMethodColor(item.request.method)}`}>
                      {item.request.method}
                    </Badge>
                  )}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "POST":
        return "bg-green-100 text-green-800 border-green-200"
      case "PUT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-200"
      case "PATCH":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="overflow-auto max-h-[calc(100vh-250px)]">
      <h3 className="font-medium mb-2">{collection.info.name}</h3>
      {collection.item && renderItems(collection.item)}
    </div>
  )
}

