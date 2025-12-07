"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTRPC } from "@/lib/trpc/client"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  canvasDataUrl: string | null
  projectId: string
}

export function ExportDialog({
  open,
  onOpenChange,
  canvasDataUrl,
  projectId,
}: ExportDialogProps) {
  const [format, setFormat] = useState<"png" | "jpg" | "webp">("png")
  const [quality, setQuality] = useState(90)

  const trpc = useTRPC()
  const exportMutation = useMutation(trpc.editor.exportImage.mutationOptions())

  const handleExport = async () => {
    if (!canvasDataUrl) return

    try {
      const result = await exportMutation.mutateAsync({
        projectId,
        imageData: canvasDataUrl,
        format,
        quality,
      })

      const link = document.createElement("a")
      link.href = result.dataUrl
      link.download = `export-${Date.now()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to export image:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
          <DialogDescription>
            Choose your export format and quality settings
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={format}
          onValueChange={(v) => setFormat(v as "png" | "jpg" | "webp")}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="png">PNG</TabsTrigger>
            <TabsTrigger value="jpg">JPEG</TabsTrigger>
            <TabsTrigger value="webp">WebP</TabsTrigger>
          </TabsList>

          <TabsContent value="png" className="space-y-4">
            <p className="text-muted-foreground text-sm">
              PNG format supports transparency and lossless compression.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Quality</label>
                <span className="text-muted-foreground text-sm">
                  {quality}%
                </span>
              </div>
              <Slider
                value={quality}
                onValueChange={(v) => {
                  const newValue = Array.isArray(v) ? v[0] : v
                  setQuality(newValue ?? 90)
                }}
                min={1}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>

          <TabsContent value="jpg" className="space-y-4">
            <p className="text-muted-foreground text-sm">
              JPEG format is best for photographs with smaller file sizes.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Quality</label>
                <span className="text-muted-foreground text-sm">
                  {quality}%
                </span>
              </div>
              <Slider
                value={quality}
                onValueChange={(v) => {
                  const newValue = Array.isArray(v) ? v[0] : v
                  setQuality(newValue ?? 90)
                }}
                min={1}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>

          <TabsContent value="webp" className="space-y-4">
            <p className="text-muted-foreground text-sm">
              WebP format offers excellent compression with quality retention.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Quality</label>
                <span className="text-muted-foreground text-sm">
                  {quality}%
                </span>
              </div>
              <Slider
                value={quality}
                onValueChange={(v) => {
                  const newValue = Array.isArray(v) ? v[0] : v
                  setQuality(newValue ?? 90)
                }}
                min={1}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
