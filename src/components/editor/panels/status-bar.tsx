"use client"

import { useEditor } from "@/components/editor/editor-context"

export function StatusBar() {
  const { canvas, isDirty } = useEditor()

  const zoom = canvas ? Math.round(canvas.getZoom() * 100) : 100

  return (
    <div
      className="border-border bg-muted/30 flex h-8 items-center justify-between border-t px-4 text-xs"
      role="status"
      aria-label="Editor status bar"
    >
      <div className="flex items-center gap-4">
        <span aria-label={`Zoom level ${zoom} percent`}>Zoom: {zoom}%</span>
        {isDirty && (
          <span
            className="text-muted-foreground"
            aria-label="Unsaved changes indicator"
          >
            ● Unsaved changes
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {canvas && (
          <span
            className="text-muted-foreground"
            aria-label={`Canvas dimensions ${canvas.width} by ${canvas.height} pixels`}
          >
            {canvas.width} × {canvas.height}
          </span>
        )}
      </div>
    </div>
  )
}
