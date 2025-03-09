"use client"

import { useState, useEffect } from "react"
import { Send, Plus, Trash2, FolderPlus, Server, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { AgentStatus } from "@/components/agent-status"
import { ServerTester } from "@/components/server-tester"
import { CollectionImporter } from "@/components/collection-importer"
import { RequestTree } from "@/components/request-tree"
import type { CollectionType, RequestItem } from "@/app/types/collection"
import { RequestManager, type SavedRequest } from "@/components/request-manager"
import { JsonEditor } from "@/components/json-editor"
import { AuthHeader } from "@/components/auth-header"

export default function ApiTesterWithFolders() {
  const [url, setUrl] = useState("http://localhost:8000/articles/")
  const [method, setMethod] = useState("GET")
  const [bearerToken, setBearerToken] = useState("")
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: "Content-Type", value: "application/json" },
    { key: "Authorization", value: "" },
  ])
  const [requestBody, setRequestBody] = useState('{\n  "key": "value"\n}')
  const [response, setResponse] = useState<{
    status?: number
    statusText?: string
    headers?: Record<string, string>
    data?: any
    error?: string
    time?: number
  }>({})
  const [loading, setLoading] = useState(false)
  const [createFolder, setCreateFolder] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [folderStructure, setFolderStructure] = useState<string[]>([])
  const [agentConnected, setAgentConnected] = useState(false)
  const [collection, setCollection] = useState<CollectionType | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null)
  const [baseUrl, setBaseUrl] = useState("http://localhost:8000")

  // Check if agent is running
  const checkAgentStatus = async () => {
    try {
      const res = await fetch("http://localhost:5001/status", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      setAgentConnected(res.ok)
    } catch (error) {
      setAgentConnected(false)
    }
  }

  // Check agent status on component mount
  useEffect(() => {
    checkAgentStatus()
    const interval = setInterval(checkAgentStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  // Update form when a request is selected from the tree
  useEffect(() => {
    if (selectedRequest) {
      // Set URL
      if (selectedRequest.request?.url?.raw) {
        // Replace variables with their values
        let processedUrl = selectedRequest.request.url.raw
        if (collection?.variable) {
          collection.variable.forEach((variable) => {
            const regex = new RegExp(`{{${variable.key}}}`, "g")
            processedUrl = processedUrl.replace(regex, variable.value || "")
          })
        }

        // Ensure URL starts with http://localhost or https://
        if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
          processedUrl = `${baseUrl}${processedUrl.startsWith("/") ? processedUrl : "/" + processedUrl}`
        }

        setUrl(processedUrl)
      }

      // Set method
      if (selectedRequest.request?.method) {
        setMethod(selectedRequest.request.method)
      }

      // Set headers
      if (selectedRequest.request?.header) {
        const newHeaders = selectedRequest.request.header.map((h) => ({
          key: h.key,
          value: h.value,
        }))
        setHeaders(newHeaders.length > 0 ? newHeaders : [{ key: "Content-Type", value: "application/json" }])
      }

      // Set body
      if (selectedRequest.request?.body?.raw) {
        setRequestBody(selectedRequest.request.body.raw)
      } else {
        setRequestBody('{\n  "key": "value"\n}')
      }
    }
  }, [selectedRequest, collection, baseUrl])

  useEffect(() => {
    if (bearerToken) {
      const authHeader = headers.find((h) => h.key === "Authorization")
      if (authHeader) {
        updateHeader(headers.indexOf(authHeader), "value", `Bearer ${bearerToken}`)
      } else {
        setHeaders([...headers, { key: "Authorization", value: `Bearer ${bearerToken}` }])
      }
    }
  }, [bearerToken])

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }])
  }

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const generateFolderStructure = () => {
    try {
      // Extract path from URL
      const urlObj = new URL(url)
      const pathSegments = urlObj.pathname.split("/").filter(Boolean)

      // Generate folder structure
      const structure = pathSegments.map((segment, index) => {
        const path = pathSegments.slice(0, index + 1).join("/")
        return `/${path}`
      })

      // Add base folder if specified
      if (folderName) {
        setFolderStructure([folderName, ...structure.map((path) => `${folderName}${path}`)])
      } else {
        setFolderStructure(structure)
      }

      toast({
        title: "Folder structure generated",
        description: "Folder structure has been created based on the URL path",
      })
    } catch (error) {
      toast({
        title: "Error generating folder structure",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
    }
  }

  const handleCollectionImport = (importedCollection: CollectionType) => {
    setCollection(importedCollection)
    toast({
      title: "Collection imported",
      description: `Successfully imported ${importedCollection.info.name}`,
    })
  }

  // Helper function to ensure URL is properly formatted
  const formatUrl = (inputUrl: string): string => {
    let formattedUrl = inputUrl.trim()

    // If URL doesn't have a protocol, add http://
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "http://" + formattedUrl
    }

    try {
      // Parse the URL to validate it
      new URL(formattedUrl)
      return formattedUrl
    } catch (error) {
      // If URL parsing fails, assume it's a path and prepend baseUrl
      return `${baseUrl}${formattedUrl.startsWith("/") ? formattedUrl : "/" + formattedUrl}`
    }
  }

  // Check if URL is a localhost URL
  const isLocalhostUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url)
      return (
        parsedUrl.hostname === "localhost" ||
        parsedUrl.hostname === "127.0.0.1" ||
        parsedUrl.hostname.startsWith("192.168.") ||
        parsedUrl.hostname.startsWith("10.")
      )
    } catch (error) {
      return false
    }
  }

  // Make a direct request without using the agent
  const makeDirectRequest = async (
    targetUrl: string,
    requestMethod: string,
    requestHeaders: Record<string, string>,
    requestData: any,
  ) => {
    const options: RequestInit = {
      method: requestMethod,
      headers: requestHeaders,
      credentials: "include",
    }

    // Add body for non-GET/DELETE requests
    if (requestMethod !== "GET" && requestMethod !== "DELETE" && requestData) {
      options.body = typeof requestData === "string" ? requestData : JSON.stringify(requestData)
    }

    const response = await fetch(targetUrl, options)

    // Extract headers
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // Parse response data based on content type
    let responseData
    const contentType = response.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      responseData = await response.json()
    } else if (contentType.includes("text/")) {
      responseData = await response.text()
    } else {
      // For binary data, just indicate it was received
      responseData = "[Binary data received]"
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData,
    }
  }

  const sendRequest = async () => {
    setLoading(true)
    const startTime = Date.now()

    try {
      // Convert headers array to object
      const headerObj: Record<string, string> = {}
      headers.forEach((h) => {
        if (h.key.trim()) headerObj[h.key] = h.value
      })

      // Parse request body if it's JSON
      let parsedBody
      try {
        parsedBody = requestBody && method !== "GET" && method !== "DELETE" ? JSON.parse(requestBody) : null
      } catch (e) {
        parsedBody = requestBody // Use as string if not valid JSON
      }

      // Create folder structure if enabled
      if (createFolder) {
        generateFolderStructure()
      }

      // Format URL
      const targetUrl = formatUrl(url)
      console.log("Sending request to:", targetUrl)

      let data

      // Check if URL is localhost - use agent if available, otherwise make direct request
      if (isLocalhostUrl(targetUrl)) {
        if (!agentConnected) {
          throw new Error("Local agent is not connected. For localhost URLs, please start the agent application.")
        }

        // Send request to local agent
        const res = await fetch("http://localhost:5001/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: targetUrl,
            method,
            headers: headerObj,
            body: method !== "GET" && method !== "DELETE" ? parsedBody : undefined,
          }),
        })

        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Agent returned status ${res.status}: ${errorText}`)
        }

        data = await res.json()
      } else {
        // For non-localhost URLs, make direct request
        data = await makeDirectRequest(
          targetUrl,
          method,
          headerObj,
          method !== "GET" && method !== "DELETE" ? parsedBody : undefined,
        )
      }

      const endTime = Date.now()

      setResponse({
        status: data.status,
        statusText: data.statusText,
        headers: data.headers,
        data: data.data,
        time: endTime - startTime,
      })
    } catch (error) {
      console.error("Request error:", error)
      setResponse({
        error: error instanceof Error ? error.message : "Failed to make request",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLoadRequest = (request: SavedRequest) => {
    setUrl(request.url)
    setMethod(request.method)
    setHeaders(request.headers)
    setRequestBody(request.body)
    if (request.bearerToken) {
      setBearerToken(request.bearerToken)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">API & Collection Tester</h1>
        <AgentStatus connected={agentConnected} onCheckConnection={checkAgentStatus} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar with collection tree */}
        <div className="col-span-12 md:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle>Collections</CardTitle>
              <CardDescription>Import and manage API collections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AuthHeader value={bearerToken} onChange={setBearerToken} />

                <RequestManager
                  onLoadRequest={handleLoadRequest}
                  currentRequest={{
                    url,
                    method,
                    headers,
                    body: requestBody,
                    bearerToken,
                  }}
                />

                <div className="mb-4">
                  <Label htmlFor="base-url">Base URL</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="base-url"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="http://localhost:8000"
                    />
                    <Button variant="outline" size="sm" onClick={() => setUrl(`${baseUrl}/articles/`)}>
                      <Server className="h-4 w-4 mr-2" /> Set
                    </Button>
                  </div>
                </div>

                <ServerTester baseUrl={baseUrl} />

                <div className="mt-4">
                  <CollectionImporter onImport={handleCollectionImport} />
                </div>

                <div className="mt-4">
                  {collection ? (
                    <RequestTree collection={collection} onSelectRequest={setSelectedRequest} />
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">Import a collection to see requests</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="col-span-12 md:col-span-9">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request</CardTitle>
                  <CardDescription>Configure your API request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Enter URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={sendRequest} disabled={loading}>
                      {loading ? "Sending..." : "Send"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 bg-muted p-2 rounded">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {isLocalhostUrl(url)
                        ? "Using local agent for localhost URL (agent must be running)"
                        : "Using direct request for production domain (no agent required)"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="create-folder" checked={createFolder} onCheckedChange={setCreateFolder} />
                    <Label htmlFor="create-folder">Create folder structure from URL</Label>
                  </div>

                  {createFolder && (
                    <div className="pt-2 space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Base folder name (optional)"
                          value={folderName}
                          onChange={(e) => setFolderName(e.target.value)}
                        />
                        <Button variant="outline" onClick={generateFolderStructure}>
                          <FolderPlus className="mr-2 h-4 w-4" /> Generate
                        </Button>
                      </div>
                    </div>
                  )}

                  <Tabs defaultValue="headers">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="headers">Headers</TabsTrigger>
                      <TabsTrigger value="body">Body</TabsTrigger>
                      <TabsTrigger value="folders">Folders</TabsTrigger>
                    </TabsList>
                    <TabsContent value="headers" className="space-y-4 mt-4">
                      {headers.map((header, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Header name"
                            value={header.key}
                            onChange={(e) => updateHeader(index, "key", e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, "value", e.target.value)}
                            className="flex-1"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeHeader(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" onClick={addHeader} className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add Header
                      </Button>
                    </TabsContent>
                    <TabsContent value="body" className="mt-4">
                      <JsonEditor value={requestBody} onChange={setRequestBody} className="h-[300px]" />
                    </TabsContent>
                    <TabsContent value="folders" className="mt-4">
                      {folderStructure.length > 0 ? (
                        <div className="bg-muted p-4 rounded-md overflow-auto h-[300px]">
                          <h3 className="font-semibold mb-2">Generated Folder Structure:</h3>
                          <ul className="space-y-1">
                            {folderStructure.map((folder, index) => (
                              <li key={index} className="flex items-center">
                                <FolderPlus className="h-4 w-4 mr-2 text-muted-foreground" />
                                {folder}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">
                          Enable folder creation and generate a structure to see folders
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Response</span>
                    {response.status && (
                      <Badge variant={response.status < 400 ? "success" : "destructive"}>
                        {response.status} {response.statusText}
                      </Badge>
                    )}
                  </CardTitle>
                  {response.time && <CardDescription>Time: {response.time}ms</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="response">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="response">Response</TabsTrigger>
                      <TabsTrigger value="headers">Headers</TabsTrigger>
                    </TabsList>
                    <TabsContent value="response" className="mt-4">
                      {response.error ? (
                        <div className="bg-destructive/10 p-4 rounded-md text-destructive">{response.error}</div>
                      ) : response.data ? (
                        <pre className="bg-muted p-4 rounded-md overflow-auto h-[300px] font-mono text-sm">
                          {typeof response.data === "object" ? JSON.stringify(response.data, null, 2) : response.data}
                        </pre>
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">Send a request to see the response</div>
                      )}
                    </TabsContent>
                    <TabsContent value="headers" className="mt-4">
                      {response.headers ? (
                        <div className="bg-muted p-4 rounded-md overflow-auto h-[300px]">
                          {Object.entries(response.headers).map(([key, value]) => (
                            <div key={key} className="mb-2">
                              <span className="font-semibold">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">Send a request to see the headers</div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

