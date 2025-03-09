"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface ServerTesterProps {
  baseUrl: string
}

export function ServerTester({ baseUrl }: ServerTesterProps) {
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [availableRoutes, setAvailableRoutes] = useState<string[]>([])

  const testServer = async () => {
    setTesting(true)
    setStatus("idle")
    setMessage("")
    setAvailableRoutes([])

    try {
      // Try to access the docs to get available routes
      const docsUrl = `${baseUrl}/docs`
      const docsResponse = await fetch(docsUrl, {
        method: "GET",
        headers: { Accept: "text/html" },
      })

      if (docsResponse.ok) {
        setStatus("success")
        setMessage(`Server is running! OpenAPI docs available at ${docsUrl}`)

        // Try some common API routes
        const commonRoutes = [
          "/articles/",
          "/api/articles/",
          "/users/",
          "/api/users/",
          "/tags/",
          "/api/tags/",
          "/categories/",
          "/api/categories/",
        ]

        const foundRoutes = []

        for (const route of commonRoutes) {
          try {
            const routeUrl = `${baseUrl}${route}`
            const response = await fetch(routeUrl, {
              method: "GET",
              headers: { Accept: "application/json" },
            })

            if (response.ok) {
              foundRoutes.push(route)
            }
          } catch (error) {
            // Ignore errors for individual routes
          }
        }

        if (foundRoutes.length > 0) {
          setAvailableRoutes(foundRoutes)
        }
      } else {
        // Try a direct request to the base URL
        const baseResponse = await fetch(baseUrl, {
          method: "GET",
        })

        if (baseResponse.ok) {
          setStatus("success")
          setMessage("Server is running, but OpenAPI docs not found")
        } else {
          setStatus("error")
          setMessage(`Server returned status ${baseResponse.status}`)
        }
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Failed to connect to server: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Test Server Connection</span>
        {status !== "idle" && (
          <Badge variant={status === "success" ? "success" : "destructive"}>
            {status === "success" ? "Connected" : "Failed"}
          </Badge>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={testServer} disabled={testing}>
        {testing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : (
          "Test Connection"
        )}
      </Button>

      {message && (
        <div
          className={`text-xs p-2 rounded ${status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {message}
        </div>
      )}

      {availableRoutes.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium">Available Routes:</span>
          <div className="mt-1 space-y-1">
            {availableRoutes.map((route) => (
              <div
                key={route}
                className="text-xs bg-blue-50 text-blue-800 p-1 rounded cursor-pointer hover:bg-blue-100"
                onClick={() => window.open(`${baseUrl}${route}`, "_blank")}
              >
                {route}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

