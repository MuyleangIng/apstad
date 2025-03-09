"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AgentStatusProps {
  connected: boolean
}

export function AgentStatus({ connected }: AgentStatusProps) {
  const testAgentConnection = async () => {
    try {
      const res = await fetch("http://localhost:5001/status", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        alert("Agent connection successful! Status endpoint is working.")
      } else {
        alert(`Agent returned status ${res.status}. The agent is running but may have issues.`)
      }
    } catch (error) {
      alert("Failed to connect to agent. Make sure the agent application is running.")
    }
  }

  const testProxyEndpoint = async () => {
    try {
      const res = await fetch("http://localhost:5001/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "http://localhost:8000/docs", // Try to access the FastAPI docs
          method: "GET",
          headers: { Accept: "text/html" },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Proxy test successful! Response status: ${data.status}`)
      } else {
        const text = await res.text()
        alert(`Proxy test failed with status ${res.status}: ${text}`)
      }
    } catch (error) {
      alert(`Failed to test proxy: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={connected ? "success" : "destructive"}>
        {connected ? "Agent Connected" : "Agent Disconnected"}
      </Badge>
      <span className="text-sm text-muted-foreground">
        {connected ? "Local agent is running and ready to proxy requests" : "Start the local agent to make requests"}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={testAgentConnection}>
          Test Status
        </Button>
        <Button variant="outline" size="sm" onClick={testProxyEndpoint}>
          Test Proxy
        </Button>
      </div>
    </div>
  )
}

