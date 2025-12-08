"use client"

import { useEffect, useState } from "react"
import { Link2, Link2Off } from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"

const DIMENSION_PRESETS = [
  { name: "Full HD", width: 1920, height: 1080 },
  { name: "HD", width: 1280, height: 720 },
  { name: "Square", width: 1024, height: 1024 },
  { name: "Default", width: 800, height: 600 },
]

const MIN_DIMENSION = 1
const MAX_DIMENSION = 10000

export function CanvasResizeTool() {
  const { canvas, addToHistory } = useEditor()
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [widthError, setWidthError] = useState("")
  const [heightError, setHeightError] = useState("")

  useEffect(() => {
    if (canvas) {
      const currentWidth = canvas.width || 800
      const currentHeight = canvas.height || 600
      setWidth(currentWidth)
      setHeight(currentHeight)
      setAspectRatio(currentWidth / currentHeight)
    }
  }, [canvas])

  const validateDimension = (value: number): string => {
    if (value < MIN_DIMENSION) {
      return `Must be at least ${MIN_DIMENSION}px`
    }
    if (value > MAX_DIMENSION) {
      return `Must not exceed ${MAX_DIMENSION}px`
    }
    return ""
  }

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10)

    if (Number.isNaN(value)) {
      setWidthError("Must be a valid number")
      return
    }

    const error = validateDimension(value)
    setWidthError(error)
    setWidth(value)

    if (!error && aspectRatioLocked && aspectRatio > 0) {
      const newHeight = Math.round(value / aspectRatio)
      setHeight(newHeight)
      setHeightError(validateDimension(newHeight))
    }
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10)

    if (Number.isNaN(value)) {
      setHeightError("Must be a valid number")
      return
    }

    const error = validateDimension(value)
    setHeightError(error)
    setHeight(value)

    if (!error && aspectRatioLocked && aspectRatio > 0) {
      const newWidth = Math.round(value * aspectRatio)
      setWidth(newWidth)
      setWidthError(validateDimension(newWidth))
    }
  }

  const handleToggleAspectRatio = () => {
    if (!aspectRatioLocked) {
      setAspectRatio(width / height)
    }
    setAspectRatioLocked(!aspectRatioLocked)
  }

  const handleApplyResize = () => {
    if (!canvas || widthError || heightError) return

    canvas.setDimensions({ width, height })
    canvas.renderAll()

    const state = JSON.stringify(canvas.toJSON())
    addToHistory(state)
  }

  const handleApplyPreset = (preset: (typeof DIMENSION_PRESETS)[number]) => {
    if (!canvas) return

    setWidth(preset.width)
    setHeight(preset.height)
    setWidthError("")
    setHeightError("")

    canvas.setDimensions({ width: preset.width, height: preset.height })
    canvas.renderAll()

    const state = JSON.stringify(canvas.toJSON())
    addToHistory(state)
  }

  const hasChanges =
    canvas && (width !== canvas.width || height !== canvas.height)
  const canApply = !widthError && !heightError && hasChanges

  return (
    <div className="space-y-4" role="region" aria-label="Canvas resize options">
      <div>
        <h3 className="mb-3 text-sm font-medium">Current Dimensions</h3>
        <div className="text-muted-foreground text-xs">
          {canvas?.width ?? 800} × {canvas?.height ?? 600} pixels
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-medium">Custom Dimensions</h3>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="canvas-width"
              className="mb-1.5 block text-xs font-medium"
            >
              Width (px)
            </label>
            <input
              id="canvas-width"
              type="number"
              value={width}
              onChange={handleWidthChange}
              min={MIN_DIMENSION}
              max={MAX_DIMENSION}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring placeholder:text-muted-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Canvas width in pixels"
              aria-invalid={!!widthError}
              aria-describedby={widthError ? "width-error" : undefined}
            />
            {widthError && (
              <p
                id="width-error"
                className="text-destructive mt-1 text-xs"
                role="alert"
              >
                {widthError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="canvas-height"
              className="mb-1.5 block text-xs font-medium"
            >
              Height (px)
            </label>
            <input
              id="canvas-height"
              type="number"
              value={height}
              onChange={handleHeightChange}
              min={MIN_DIMENSION}
              max={MAX_DIMENSION}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring placeholder:text-muted-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Canvas height in pixels"
              aria-invalid={!!heightError}
              aria-describedby={heightError ? "height-error" : undefined}
            />
            {heightError && (
              <p
                id="height-error"
                className="text-destructive mt-1 text-xs"
                role="alert"
              >
                {heightError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Lock Aspect Ratio</span>
            <Toggle
              pressed={aspectRatioLocked}
              onPressedChange={handleToggleAspectRatio}
              variant="outline"
              size="sm"
              aria-label="Toggle aspect ratio lock"
              aria-pressed={aspectRatioLocked}
            >
              {aspectRatioLocked ? (
                <Link2 className="size-4" />
              ) : (
                <Link2Off className="size-4" />
              )}
            </Toggle>
          </div>

          <Button
            onClick={handleApplyResize}
            disabled={!canApply}
            className="w-full"
            aria-label="Apply custom canvas dimensions"
          >
            Apply Dimensions
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-medium">Dimension Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {DIMENSION_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset(preset)}
              className="flex h-auto flex-col items-start gap-0.5 px-3 py-2"
              aria-label={`Apply ${preset.name} preset: ${preset.width} by ${preset.height} pixels`}
            >
              <span className="text-xs font-medium">{preset.name}</span>
              <span className="text-muted-foreground text-[10px]">
                {preset.width} × {preset.height}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
