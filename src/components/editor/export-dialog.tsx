"use client"

import { useEffect, useState } from "react"
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
import { embedExifMetadata, getDefaultExifMetadata } from "@/lib/utils/exif"

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
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [originalWidth, setOriginalWidth] = useState(0)
  const [originalHeight, setOriginalHeight] = useState(0)
  const [estimatedFileSize, setEstimatedFileSize] = useState<string>("")
  const [batchExport, setBatchExport] = useState(false)
  const [selectedFormats, setSelectedFormats] = useState<
    ("png" | "jpg" | "webp")[]
  >(["png"])

  const trpc = useTRPC()
  const exportMutation = useMutation(trpc.editor.exportImage.mutationOptions())

  // Extract dimensions from canvas data URL
  useEffect(() => {
    if (!canvasDataUrl || !open) return

    const img = new Image()
    img.onload = () => {
      setOriginalWidth(img.width)
      setOriginalHeight(img.height)
      setWidth(img.width)
      setHeight(img.height)
      estimateFileSize(canvasDataUrl, format, quality)
    }
    img.src = canvasDataUrl
  }, [canvasDataUrl, open, format, quality])

  const estimateFileSize = (dataUrl: string, fmt: string, qual: number) => {
    try {
      // Extract base64 data
      const base64 = dataUrl.split(",")[1]
      if (!base64) return

      // Decode base64 to get approximate byte size
      const byteSize = (base64.length * 3) / 4

      // Apply format and quality multipliers
      let estimatedSize = byteSize
      if (fmt === "jpg" || fmt === "webp") {
        estimatedSize = byteSize * (qual / 100) * 0.7 // JPEG/WebP compression
      } else {
        estimatedSize = byteSize * 0.9 // PNG compression
      }

      // Format size
      if (estimatedSize < 1024) {
        setEstimatedFileSize(`${Math.round(estimatedSize)} B`)
      } else if (estimatedSize < 1024 * 1024) {
        setEstimatedFileSize(`${(estimatedSize / 1024).toFixed(1)} KB`)
      } else {
        setEstimatedFileSize(`${(estimatedSize / (1024 * 1024)).toFixed(2)} MB`)
      }
    } catch (error) {
      console.error("Failed to estimate file size:", error)
      setEstimatedFileSize("")
    }
  }

  const handleWidthChange = (value: string) => {
    const newWidth = parseInt(value) || 0
    setWidth(newWidth)
    if (maintainAspectRatio && originalWidth > 0) {
      const aspectRatio = originalHeight / originalWidth
      setHeight(Math.round(newWidth * aspectRatio))
    }
  }

  const handleHeightChange = (value: string) => {
    const newHeight = parseInt(value) || 0
    setHeight(newHeight)
    if (maintainAspectRatio && originalHeight > 0) {
      const aspectRatio = originalWidth / originalHeight
      setWidth(Math.round(newHeight * aspectRatio))
    }
  }

  const handleExport = async () => {
    if (!canvasDataUrl) return

    try {
      const formatsToExport = batchExport ? selectedFormats : [format]

      for (const exportFormat of formatsToExport) {
        let exportDataUrl = canvasDataUrl

        // Resize if dimensions changed
        if (width !== originalWidth || height !== originalHeight) {
          const img = new Image()
          img.src = canvasDataUrl
          await new Promise((resolve) => {
            img.onload = resolve
          })

          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            exportDataUrl = canvas.toDataURL(
              `image/${exportFormat}`,
              quality / 100,
            )
          }
        }

        if (exportFormat === "jpg") {
          const exifMetadata = getDefaultExifMetadata()
          exportDataUrl = embedExifMetadata(exportDataUrl, exifMetadata)
        }

        const result = await exportMutation.mutateAsync({
          projectId,
          imageData: exportDataUrl,
          format: exportFormat,
          quality,
        })

        const link = document.createElement("a")
        link.href = result.dataUrl
        link.download = `export-${Date.now()}.${exportFormat}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        if (formatsToExport.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to export image:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
          <DialogDescription>
            Choose your export format, dimensions, and quality settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dimensions Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Dimensions</h4>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-muted-foreground mb-1 block text-xs">
                  Width
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  min={1}
                />
              </div>
              <div className="mt-5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                  title={
                    maintainAspectRatio
                      ? "Unlock aspect ratio"
                      : "Lock aspect ratio"
                  }
                >
                  {maintainAspectRatio ? "🔒" : "🔓"}
                </Button>
              </div>
              <div className="flex-1">
                <label className="text-muted-foreground mb-1 block text-xs">
                  Height
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  min={1}
                />
              </div>
            </div>
            {estimatedFileSize && (
              <p className="text-muted-foreground text-xs">
                Estimated file size:{" "}
                <span className="font-medium">{estimatedFileSize}</span>
              </p>
            )}
          </div>

          {/* Format and Quality Section */}
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

          {/* Batch Export Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                id="batch-export"
                type="checkbox"
                checked={batchExport}
                onChange={(e) => {
                  setBatchExport(e.target.checked)
                  if (e.target.checked && !selectedFormats.includes(format)) {
                    setSelectedFormats([format])
                  }
                }}
                className="border-input h-4 w-4 rounded"
              />
              <label
                htmlFor="batch-export"
                className="cursor-pointer text-sm font-medium"
              >
                Export in multiple formats
              </label>
            </div>
            {batchExport && (
              <div className="bg-muted/50 space-y-2 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">
                  Select formats to export:
                </p>
                <div className="flex gap-3">
                  {(["png", "jpg", "webp"] as const).map((fmt) => (
                    <label
                      key={fmt}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(fmt)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFormats([...selectedFormats, fmt])
                          } else {
                            setSelectedFormats(
                              selectedFormats.filter((f) => f !== fmt),
                            )
                          }
                        }}
                        className="border-input h-4 w-4 rounded"
                      />
                      <span className="text-sm">{fmt.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={
              exportMutation.isPending ||
              (batchExport && selectedFormats.length === 0)
            }
          >
            {exportMutation.isPending
              ? "Exporting..."
              : batchExport
                ? `Export ${selectedFormats.length} Format${selectedFormats.length > 1 ? "s" : ""}`
                : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
