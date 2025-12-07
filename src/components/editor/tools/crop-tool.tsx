"use client"

import { useEffect, useState } from "react"
import { Rect } from "fabric"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const ASPECT_RATIOS = [
  { label: "Free", value: null },
  { label: "Square (1:1)", value: 1 },
  { label: "Portrait (4:5)", value: 4 / 5 },
  { label: "Landscape (16:9)", value: 16 / 9 },
  { label: "Landscape (4:3)", value: 4 / 3 },
  { label: "Story (9:16)", value: 9 / 16 },
]

export function CropTool() {
  const { canvas, addToHistory } = useEditor()
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)
  const [cropRect, setCropRect] = useState<Rect | null>(null)

  useEffect(() => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const currentRotation = activeObject.angle ?? 0
      setRotation(currentRotation)

      const rect = new Rect({
        left: activeObject.left,
        top: activeObject.top,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        width: (activeObject.width ?? 100) * (activeObject.scaleX ?? 1),
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        height: (activeObject.height ?? 100) * (activeObject.scaleY ?? 1),
        fill: "transparent",
        stroke: "blue",
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: true,
        hasControls: true,
      })

      canvas.add(rect)
      canvas.setActiveObject(rect)
      setCropRect(rect)
      canvas.renderAll()

      return () => {
        canvas.remove(rect)
        canvas.renderAll()
      }
    }
  }, [canvas])

  useEffect(() => {
    if (!cropRect || !selectedRatio) return

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const width = cropRect.width ?? 100
    const height = selectedRatio
      ? width / selectedRatio
      : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (cropRect.height ?? 100)

    cropRect.set({ height })
    canvas?.renderAll()
  }, [selectedRatio, cropRect, canvas])

  const handleApplyCrop = () => {
    if (!canvas || !cropRect) return

    const activeObject = canvas.getActiveObjects()[0]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!activeObject || activeObject === cropRect) {
      const allObjects = canvas.getObjects()
      const targetObject = allObjects.find((obj) => obj !== cropRect)
      if (targetObject) {
        canvas.setActiveObject(targetObject)
      }
    }

    const target = canvas.getActiveObject()
    if (target && target !== cropRect) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const cropLeft = cropRect.left ?? 0
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const cropTop = cropRect.top ?? 0
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const cropWidth = cropRect.width ?? 0
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const cropHeight = cropRect.height ?? 0

      target.set({
        left: cropLeft,
        top: cropTop,
        width: cropWidth,
        height: cropHeight,
        scaleX: 1,
        scaleY: 1,
      })

      canvas.remove(cropRect)
      setCropRect(null)
      canvas.renderAll()

      const state = JSON.stringify(canvas.toJSON())
      addToHistory(state)
    }
  }

  const handleRotate = (degrees: number) => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject !== cropRect) {
      const newRotation = (((rotation + degrees) % 360) + 360) % 360
      activeObject.rotate(newRotation)
      setRotation(newRotation)
      canvas.renderAll()

      const state = JSON.stringify(canvas.toJSON())
      addToHistory(state)
    }
  }

  const handleCancel = () => {
    if (!canvas) return
    if (cropRect) {
      canvas.remove(cropRect)
      setCropRect(null)
    }
    canvas.discardActiveObject()
    canvas.renderAll()
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">Aspect Ratio</h3>
        <div className="grid grid-cols-2 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <Button
              key={ratio.label}
              variant={selectedRatio === ratio.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRatio(ratio.value)}
            >
              {ratio.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-medium">Rotation</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleRotate(-90)}>
            Rotate Left
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleRotate(90)}>
            Rotate Right
          </Button>
        </div>
        {rotation !== 0 && (
          <p className="text-muted-foreground mt-2 text-xs">
            Current: {rotation}°
          </p>
        )}
      </div>

      <Separator />

      <div className="mt-auto flex gap-2">
        <Button variant="outline" onClick={handleCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleApplyCrop} className="flex-1">
          Apply Crop
        </Button>
      </div>
    </div>
  )
}
