"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"

export function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (!isMobile) return null

  return (
    <div className="bg-background fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
        <h1 className="mb-4 text-2xl font-bold">Desktop Only</h1>
        <p className="text-muted-foreground mb-6">
          The image editor requires a larger screen to function properly. Please
          access this application from a desktop or laptop computer with a
          screen width of at least 768px.
        </p>
        <div className="bg-muted rounded-lg p-4 text-sm">
          <p className="font-semibold">Current viewport:</p>
          <p className="text-muted-foreground">
            {typeof window !== "undefined" ? window.innerWidth : 0}px wide
          </p>
        </div>
      </div>
    </div>
  )
}
