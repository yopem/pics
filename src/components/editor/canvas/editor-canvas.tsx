"use client"

import { useEffect, useRef, useState } from "react"
import type { Canvas as FabricCanvas, Image as FabricImage } from "fabric"
import { Upload } from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { downscaleImage, shouldDownscaleImage } from "@/lib/utils/performance"

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { canvas, setCanvas, addToHistory, isLoadingProject } = useEditor()
  const [isFabricLoading, setIsFabricLoading] = useState(true)
  const fabricRef = useRef<{
    Canvas: typeof FabricCanvas
    Image: typeof FabricImage
  } | null>(null)

  useEffect(() => {
    let mounted = true

    const loadFabric = async () => {
      try {
        const fabric = await import("fabric")
        if (mounted) {
          fabricRef.current = {
            Canvas: fabric.Canvas,
            Image: fabric.Image,
          }
          setIsFabricLoading(false)
        }
      } catch (error) {
        console.error("Failed to load Fabric.js:", error)
        setIsFabricLoading(false)
      }
    }

    void loadFabric()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !fabricRef.current || isFabricLoading) return

    const { Canvas } = fabricRef.current
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      enableRetinaScaling: true,
      renderOnAddRemove: true,
      skipTargetFind: false,
      objectCaching: true,
      stateful: true,
    })

    fabricCanvas.on("object:added", (e) => {
      e.target.objectCaching = true
    })

    setCanvas(fabricCanvas)

    const initialState = JSON.stringify(fabricCanvas.toJSON())
    addToHistory(initialState)

    fabricCanvas.on("object:modified", () => {
      const state = JSON.stringify(fabricCanvas.toJSON())
      addToHistory(state)
    })

    return () => {
      void fabricCanvas.dispose()
      setCanvas(null)
    }
  }, [setCanvas, addToHistory, isFabricLoading])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !canvas || !fabricRef.current) return

    const { Image: FabricImage } = fabricRef.current
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        let imgUrl = event.target?.result as string

        const tempImg = new Image()
        await new Promise((resolve, reject) => {
          tempImg.onload = resolve
          tempImg.onerror = reject
          tempImg.src = imgUrl
        })

        if (shouldDownscaleImage(tempImg.width, tempImg.height)) {
          imgUrl = await downscaleImage(imgUrl)
        }

        const img = await FabricImage.fromURL(imgUrl)

        const maxWidth = canvas.width || 800
        const maxHeight = canvas.height || 600

        if (img.width && img.height) {
          const scale = Math.min(
            maxWidth / img.width,
            maxHeight / img.height,
            1,
          )
          img.scale(scale)
        }

        canvas.add(img)
        canvas.centerObject(img)
        canvas.setActiveObject(img)
        canvas.renderAll()

        const state = JSON.stringify(canvas.toJSON())
        addToHistory(state)
      } catch (error) {
        console.error("Failed to load image:", error)
      }
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const hasObjects = canvas && canvas.getObjects().length > 0

  return (
    <div
      className="bg-muted/20 relative flex flex-1 items-center justify-center p-4"
      role="main"
      aria-label="Image editing canvas"
    >
      <canvas
        ref={canvasRef}
        className="border-border border shadow-lg"
        aria-label="Canvas for image editing"
      />

      {isFabricLoading || isLoadingProject ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div
              className="border-muted border-t-primary mx-auto mb-4 size-16 animate-spin rounded-full border-4"
              aria-hidden="true"
            />
            <h3 className="mb-2 text-lg font-semibold">
              {isFabricLoading ? "Loading Editor" : "Loading Project"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isFabricLoading
                ? "Initializing the editor..."
                : "Please wait while we load your project..."}
            </p>
          </div>
        </div>
      ) : (
        !hasObjects && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Upload
                className="text-muted-foreground mx-auto mb-4 size-16"
                aria-hidden="true"
              />
              <h3 className="mb-2 text-lg font-semibold">Upload an Image</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Get started by uploading an image to edit
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                aria-label="Choose image to upload"
              >
                <Upload className="mr-2 size-4" aria-hidden="true" />
                Choose Image
              </Button>
            </div>
          </div>
        )
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload image file"
      />
    </div>
  )
}
