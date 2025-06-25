"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function TestApiButtons() {
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const handleTestApi1 = async () => {
    setLoading1(true)
    try {
      const response = await fetch('/api/test1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(data.message || "Report generated successfully!")
      } else {
        toast.error(data.message || "Failed to generate report")
      }
    } catch (error) {
      toast.error("Failed to generate report")
    } finally {
      setLoading1(false)
    }
  }

  const handleTestApi2 = async () => {
    setLoading2(true)
    try {
      const response = await fetch('/api/test2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(data.message || "Notification sent successfully!")
      } else {
        toast.error(data.message || "Failed to send notification")
      }
    } catch (error) {
      toast.error("Failed to send notification")
    } finally {
      setLoading2(false)
    }
  }

  return (
    <div className="flex gap-4">
      <Button
        onClick={handleTestApi1}
        disabled={loading1}
        variant="default"
      >
        {loading1 ? "Generating..." : "Generate Report"}
      </Button>
      <Button
        onClick={handleTestApi2}
        disabled={loading2}
        variant="secondary"
      >
        {loading2 ? "Sending..." : "Send Notification"}
      </Button>
    </div>
  )
} 