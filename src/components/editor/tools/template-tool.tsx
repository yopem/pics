"use client"

import { useState } from "react"
import { FabricImage, Rect } from "fabric"
import { Eye, EyeOff } from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle"
import { socialMediaTemplates } from "@/lib/editor/templates"

const CATEGORIES = [
  "All",
  ...Array.from(new Set(socialMediaTemplates.map((t) => t.platform))),
]

type FitMode = "fit" | "fill" | "crop"

const SAFE_ZONE_ID = "template-safe-zone-overlay"

export function TemplateTool() {
  const { canvas, addToHistory } = useEditor()
  const [fitMode, setFitMode] = useState<FitMode>("fit")
  const [showSafeZone, setShowSafeZone] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<
    (typeof socialMediaTemplates)[0] | null
  >(null)

  const removeSafeZoneOverlay = () => {
    if (!canvas) return

    const objects = canvas.getObjects()
    const safeZoneOverlay = objects.find(
      (obj) => obj.get("data") === SAFE_ZONE_ID,
    )
    if (safeZoneOverlay) {
      canvas.remove(safeZoneOverlay)
      canvas.renderAll()
    }
  }

  const toggleSafeZone = () => {
    if (!canvas || !currentTemplate) return

    if (showSafeZone) {
      removeSafeZoneOverlay()
      setShowSafeZone(false)
    } else {
      const safeZone = currentTemplate.safeZone ?? {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      }

      const overlay = new Rect({
        left: safeZone.left,
        top: safeZone.top,
        width: currentTemplate.width - safeZone.left - safeZone.right,
        height: currentTemplate.height - safeZone.top - safeZone.bottom,
        fill: "transparent",
        stroke: "#22c55e",
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
      })

      overlay.set("data", SAFE_ZONE_ID)

      canvas.add(overlay)
      canvas.renderAll()
      setShowSafeZone(true)
    }
  }

  const handleApplyTemplate = (template: (typeof socialMediaTemplates)[0]) => {
    if (!canvas) return

    setCurrentTemplate(template)

    if (showSafeZone) {
      removeSafeZoneOverlay()
      setShowSafeZone(false)
    }

    const activeObject = canvas.getActiveObject()

    if (fitMode === "fit") {
      canvas.setDimensions({
        width: template.width,
        height: template.height,
      })
      canvas.renderAll()
    } else if (fitMode === "fill" && activeObject instanceof FabricImage) {
      const imageWidth = activeObject.width || 1
      const imageHeight = activeObject.height || 1
      const imageRatio = imageWidth / imageHeight
      const templateRatio = template.width / template.height

      let scale = 1

      if (imageRatio > templateRatio) {
        scale = template.height / imageHeight
      } else {
        scale = template.width / imageWidth
      }

      activeObject.scale(scale)
      activeObject.set({
        left: template.width / 2,
        top: template.height / 2,
        originX: "center",
        originY: "center",
      })

      canvas.setDimensions({
        width: template.width,
        height: template.height,
      })

      canvas.renderAll()

      const state = JSON.stringify(canvas.toJSON())
      addToHistory(state)
    } else if (fitMode === "crop" && activeObject instanceof FabricImage) {
      const imageWidth = activeObject.width || 1
      const imageHeight = activeObject.height || 1
      const currentScaleX = activeObject.scaleX || 1
      const currentScaleY = activeObject.scaleY || 1

      const scaledWidth = imageWidth * currentScaleX
      const scaledHeight = imageHeight * currentScaleY

      const cropX = Math.max(0, (scaledWidth - template.width) / 2)
      const cropY = Math.max(0, (scaledHeight - template.height) / 2)

      activeObject.set({
        cropX: cropX / currentScaleX,
        cropY: cropY / currentScaleY,
        width: Math.min(imageWidth, template.width / currentScaleX),
        height: Math.min(imageHeight, template.height / currentScaleY),
        left: template.width / 2,
        top: template.height / 2,
        originX: "center",
        originY: "center",
      })

      canvas.setDimensions({
        width: template.width,
        height: template.height,
      })

      canvas.renderAll()

      const state = JSON.stringify(canvas.toJSON())
      addToHistory(state)
    }
  }

  return (
    <div
      className="flex h-full flex-col gap-4 p-4"
      role="region"
      aria-label="Template tool options"
    >
      <div>
        <h3 className="mb-3 text-sm font-medium">Social Media Templates</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Select a template to resize your canvas
        </p>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-medium" id="fit-mode-heading">
          Fit Mode
        </h4>
        <Tabs
          value={fitMode}
          onValueChange={(value) => setFitMode(value as FitMode)}
        >
          <TabsList
            className="grid w-full grid-cols-3"
            role="tablist"
            aria-labelledby="fit-mode-heading"
          >
            <TabsTrigger value="fit">Fit</TabsTrigger>
            <TabsTrigger value="fill">Fill</TabsTrigger>
            <TabsTrigger value="crop">Crop</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-muted-foreground mt-2 text-xs" aria-live="polite">
          {fitMode === "fit" &&
            "Resize canvas to template size (preserves image)"}
          {fitMode === "fill" &&
            "Scale image to fill template (may show borders)"}
          {fitMode === "crop" && "Crop image to exact template dimensions"}
        </p>
      </div>

      {currentTemplate && (
        <>
          <Separator />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-medium">Safe Zone Overlay</h4>
              <Toggle
                pressed={showSafeZone}
                onPressedChange={toggleSafeZone}
                size="sm"
                aria-label={
                  showSafeZone
                    ? "Hide safe zone overlay"
                    : "Show safe zone overlay"
                }
                aria-pressed={showSafeZone}
              >
                {showSafeZone ? (
                  <Eye className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-3 w-3" aria-hidden="true" />
                )}
              </Toggle>
            </div>
            <p className="text-muted-foreground text-xs" aria-live="polite">
              {showSafeZone
                ? "Safe zone is visible (green dashed border)"
                : "Show the safe zone where content won't be cropped"}
            </p>
          </div>
        </>
      )}

      <Separator />

      {CATEGORIES.map((category) => {
        const templates =
          category === "All"
            ? socialMediaTemplates
            : socialMediaTemplates.filter((t) => t.platform === category)

        return (
          <div key={category}>
            <h4 className="mb-2 text-xs font-medium">{category}</h4>
            <div className="space-y-2">
              {templates.map((template) => (
                <Button
                  key={template.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyTemplate(template)}
                  className="w-full justify-start"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs">{template.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {template.width} × {template.height}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
            {category !== CATEGORIES[CATEGORIES.length - 1] && (
              <Separator className="my-3" />
            )}
          </div>
        )
      })}
    </div>
  )
}
