"use client"

import { useState } from "react"
import { FabricImage, Gradient, Rect } from "fabric"
import { Upload } from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PRESET_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Gray", value: "#6b7280" },
]

const PRESET_GRADIENTS = [
  {
    name: "Sunset",
    colors: ["#ff6b6b", "#feca57"],
    angle: 45,
  },
  {
    name: "Ocean",
    colors: ["#4facfe", "#00f2fe"],
    angle: 135,
  },
  {
    name: "Forest",
    colors: ["#134e5e", "#71b280"],
    angle: 90,
  },
  {
    name: "Purple Haze",
    colors: ["#667eea", "#764ba2"],
    angle: 45,
  },
]

export function BackgroundReplacementTool() {
  const { canvas, addToHistory } = useEditor()
  const [selectedColor, setSelectedColor] = useState("#ffffff")
  const [customColor, setCustomColor] = useState("#ffffff")

  const handleSolidColor = (color: string) => {
    if (!canvas) return

    canvas.backgroundColor = color
    canvas.renderAll()

    const state = JSON.stringify(canvas.toJSON())
    addToHistory(state)
  }

  const handleGradient = (gradient: (typeof PRESET_GRADIENTS)[0]) => {
    if (!canvas) return

    const canvasWidth = canvas.width || 800
    const canvasHeight = canvas.height || 600

    const gradientFill = new Gradient({
      type: "linear",
      coords: {
        x1: 0,
        y1: 0,
        x2: canvasWidth,
        y2: canvasHeight,
      },
      colorStops: [
        { offset: 0, color: gradient.colors[0] },
        { offset: 1, color: gradient.colors[1] },
      ],
    })

    const gradientRect = new Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: canvasHeight,
      selectable: false,
      evented: false,
      fill: gradientFill,
    })

    const objects = canvas.getObjects()
    const filteredObjects = objects.filter((obj) => obj.selectable !== false)

    canvas.remove(...objects)
    canvas.add(gradientRect)
    canvas.add(...filteredObjects)
    canvas.renderAll()

    const state = JSON.stringify(canvas.toJSON())
    addToHistory(state)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !canvas) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string

      try {
        const img = await FabricImage.fromURL(dataUrl)

        const canvasWidth = canvas.width || 800
        const canvasHeight = canvas.height || 600

        const scaleX = canvasWidth / (img.width || 1)
        const scaleY = canvasHeight / (img.height || 1)
        const scale = Math.max(scaleX, scaleY)

        img.set({
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
        })

        const objects = canvas.getObjects()
        const filteredObjects = objects.filter(
          (obj) => obj.selectable !== false,
        )

        canvas.remove(...objects)
        canvas.add(img)
        canvas.add(...filteredObjects)
        canvas.renderAll()

        const state = JSON.stringify(canvas.toJSON())
        addToHistory(state)
      } catch (error) {
        console.error("Failed to load background image:", error)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveBackground = () => {
    if (!canvas) return

    canvas.backgroundColor = "transparent"

    const objects = canvas.getObjects()
    const backgroundObjects = objects.filter((obj) => obj.selectable === false)

    canvas.remove(...backgroundObjects)
    canvas.renderAll()

    const state = JSON.stringify(canvas.toJSON())
    addToHistory(state)
  }

  return (
    <div
      className="flex h-full flex-col gap-4 p-4"
      role="region"
      aria-label="Background replacement tool options"
    >
      <div>
        <h3 className="mb-3 text-sm font-medium">Background Replacement</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Replace the canvas background with colors, gradients, or images
        </p>
      </div>

      <Tabs defaultValue="solid" className="w-full">
        <TabsList
          className="grid w-full grid-cols-3"
          role="tablist"
          aria-label="Background type"
        >
          <TabsTrigger value="solid">Solid</TabsTrigger>
          <TabsTrigger value="gradient">Gradient</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>

        <TabsContent value="solid" className="space-y-4" role="tabpanel">
          <div>
            <h4 className="mb-3 text-xs font-medium" id="preset-colors-heading">
              Preset Colors
            </h4>
            <div
              className="grid grid-cols-4 gap-2"
              role="group"
              aria-labelledby="preset-colors-heading"
            >
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    setSelectedColor(color.value)
                    handleSolidColor(color.value)
                  }}
                  className="border-border hover:border-primary group relative aspect-square rounded-md border-2 transition-all"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Set background to ${color.name}`}
                  aria-pressed={selectedColor === color.value}
                >
                  {selectedColor === color.value && (
                    <div className="bg-primary bg-opacity-20 absolute inset-0 flex items-center justify-center rounded-md">
                      <div className="bg-background h-2 w-2 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3 text-xs font-medium" id="custom-color-heading">
              Custom Color
            </h4>
            <div
              className="flex gap-2"
              role="group"
              aria-labelledby="custom-color-heading"
            >
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="border-border h-10 w-20 cursor-pointer rounded-md border-2"
                aria-label="Choose custom background color"
              />
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSolidColor(customColor)}
                aria-label="Apply selected custom color"
              >
                Apply Custom Color
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gradient" className="space-y-4" role="tabpanel">
          <div>
            <h4
              className="mb-3 text-xs font-medium"
              id="preset-gradients-heading"
            >
              Preset Gradients
            </h4>
            <div
              className="grid grid-cols-2 gap-3"
              role="group"
              aria-labelledby="preset-gradients-heading"
            >
              {PRESET_GRADIENTS.map((gradient) => (
                <button
                  key={gradient.name}
                  onClick={() => handleGradient(gradient)}
                  className="border-border hover:border-primary group relative h-20 rounded-md border-2 transition-all"
                  style={{
                    background: `linear-gradient(${gradient.angle}deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                  }}
                  title={gradient.name}
                  aria-label={`Apply ${gradient.name} gradient background`}
                >
                  <div className="bg-opacity-0 group-hover:bg-opacity-10 absolute inset-0 flex items-center justify-center rounded-md bg-black transition-all">
                    <span className="text-background text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                      {gradient.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4" role="tabpanel">
          <div>
            <h4 className="mb-3 text-xs font-medium">
              Upload Background Image
            </h4>
            <label className="border-border hover:border-primary flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors">
              <Upload
                className="text-muted-foreground mb-2 h-8 w-8"
                aria-hidden="true"
              />
              <span className="text-muted-foreground mb-1 text-sm font-medium">
                Click to upload
              </span>
              <span className="text-muted-foreground text-xs">
                PNG, JPG, or WebP
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Upload background image"
              />
            </label>
          </div>

          <div className="text-muted-foreground text-xs">
            <p className="mb-1 font-medium">Tips:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Image will be scaled to fill the canvas</li>
              <li>Use high resolution images for best quality</li>
              <li>Image will be placed behind all objects</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <Button
        variant="outline"
        onClick={handleRemoveBackground}
        aria-label="Remove background and reset to transparent"
      >
        Remove Background
      </Button>

      <div className="text-muted-foreground text-xs">
        <p className="mb-1 font-medium">Note:</p>
        <p>
          Background changes affect the entire canvas and will be placed behind
          all objects. Use "Remove Background" to reset to transparent.
        </p>
      </div>
    </div>
  )
}
