"use client"

import { useMutation } from "@tanstack/react-query"
import { Image as FabricImage } from "fabric"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/lib/trpc/client"

export function BackgroundRemovalTool() {
  const { canvas, addToHistory } = useEditor()

  const trpc = useTRPC()
  const removeBackgroundMutation = useMutation(
    trpc.editor.removeBackground.mutationOptions(),
  )

  const handleRemoveBackground = async () => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject || !(activeObject instanceof FabricImage)) {
      console.warn("Please select an image to remove background")
      return
    }

    try {
      const dataUrl = activeObject.toDataURL({})

      const result = await removeBackgroundMutation.mutateAsync({
        imageData: dataUrl,
      })

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
    } catch (error) {
      console.error("Failed to remove background:", error)
    }
  }

  const activeObject = canvas?.getActiveObject()
  const isImage = activeObject instanceof FabricImage

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">Background Removal</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Remove the background from your image using AI
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
        <p>Tips:</p>
        <ul className="mt-1 ml-4 list-disc space-y-1">
          <li>Select an image first</li>
          <li>Works best with clear subject photos</li>
          <li>Processing may take a few seconds</li>
        </ul>
      </div>
    </div>
  )
}
