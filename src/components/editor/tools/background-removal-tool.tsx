"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { FabricImage } from "fabric"
import { Loader2 } from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTRPC } from "@/lib/trpc/client"

type QualityLevel = "standard" | "high"

export function BackgroundRemovalTool() {
  const { canvas, addToHistory } = useEditor()
  const [showProgress, setShowProgress] = useState(false)
  const [progressMessage, setProgressMessage] = useState("")
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [quality, setQuality] = useState<QualityLevel>("standard")
  const abortControllerRef = useRef<AbortController | null>(null)

  const trpc = useTRPC()
  const removeBackgroundMutation = useMutation(
    trpc.editor.removeBackground.mutationOptions(),
  )

  useEffect(() => {
    if (removeBackgroundMutation.isPending) {
      const interval = setInterval(() => {
        setProgressPercentage((prev) => {
          if (prev >= 90) return prev
          return prev + 5
        })
      }, 500)

      return () => clearInterval(interval)
    } else {
      setProgressPercentage(0)
    }
  }, [removeBackgroundMutation.isPending])

  const handleRemoveBackground = async () => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject || !(activeObject instanceof FabricImage)) {
      console.warn("Please select an image to remove background")
      return
    }

    setShowProgress(true)
    setProgressMessage("Preparing image...")
    setProgressPercentage(10)
    abortControllerRef.current = new AbortController()

    try {
      setProgressMessage("Removing background...")
      setProgressPercentage(30)
      const dataUrl = activeObject.toDataURL({})

      const result = await removeBackgroundMutation.mutateAsync({
        imageData: dataUrl,
      })

      setProgressMessage("Applying changes...")
      setProgressPercentage(90)

      const img = await FabricImage.fromURL(result.dataUrl)

      img.set({
        left: activeObject.left,
        top: activeObject.top,
        scaleX: activeObject.scaleX,
        scaleY: activeObject.scaleY,
        angle: activeObject.angle,
      })

      canvas.remove(activeObject)
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()

      const state = JSON.stringify(canvas.toJSON())
      addToHistory(state)

      setProgressMessage("Complete!")
      setProgressPercentage(100)
      setTimeout(() => {
        setShowProgress(false)
        setProgressMessage("")
        setProgressPercentage(0)
      }, 500)
    } catch (error) {
      console.error("Failed to remove background:", error)
      setProgressMessage(
        error instanceof Error
          ? error.message
          : "Failed to remove background. Please try again.",
      )
      setTimeout(() => {
        setShowProgress(false)
        setProgressMessage("")
        setProgressPercentage(0)
      }, 2000)
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setShowProgress(false)
    setProgressMessage("")
    setProgressPercentage(0)
    removeBackgroundMutation.reset()
  }

  const activeObject = canvas?.getActiveObject()
  const isImage = activeObject instanceof FabricImage

  return (
    <>
      <div className="flex h-full flex-col gap-4 p-4">
        <div>
          <h3 className="mb-3 text-sm font-medium">Background Removal</h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Remove the background from your image using AI
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium">
            Quality Level
          </label>
          <div className="flex gap-2">
            <Button
              variant={quality === "standard" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuality("standard")}
              className="flex-1"
            >
              Standard
            </Button>
            <Button
              variant={quality === "high" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuality("high")}
              className="flex-1"
            >
              High
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            {quality === "standard"
              ? "Faster processing, good for most images"
              : "Better quality, takes longer to process"}
          </p>
        </div>

        <Button
          onClick={handleRemoveBackground}
          disabled={removeBackgroundMutation.isPending || !isImage}
        >
          {removeBackgroundMutation.isPending
            ? "Processing..."
            : "Remove Background"}
        </Button>

        <div className="text-muted-foreground mt-2 text-xs">
          <p className="mb-2 font-medium">Tips:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Select an image first</li>
            <li>Works best with clear subject photos</li>
            <li>Processing may take 10-30 seconds</li>
            <li>Large images will be automatically optimized</li>
          </ul>
        </div>

        <div className="border-border bg-muted/50 mt-4 rounded-md border p-3 text-xs">
          <p className="mb-1 font-medium">Processing Information:</p>
          <p className="text-muted-foreground">
            Background removal uses AI to detect and remove the background from
            your images. The process runs on the server and may take some time
            depending on image complexity.
          </p>
        </div>
      </div>

      <Dialog open={showProgress} onOpenChange={setShowProgress}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Removing Background</DialogTitle>
            <DialogDescription>
              Please wait while we process your image
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <Loader2 className="text-primary h-12 w-12 animate-spin" />
            <div className="w-full px-4">
              <div className="bg-muted mb-2 h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-muted-foreground text-center text-sm">
                {progressMessage} ({progressPercentage}%)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={!removeBackgroundMutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
