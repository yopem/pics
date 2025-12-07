"use client"

import { useState } from "react"
import { FabricImage } from "fabric"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { socialMediaTemplates } from "@/lib/editor/templates"

const CATEGORIES = [
  "All",
  ...Array.from(new Set(socialMediaTemplates.map((t) => t.platform))),
]

type FitMode = "fit" | "fill" | "crop"

export function TemplateTool() {
  const { canvas, addToHistory } = useEditor()
  const [fitMode, setFitMode] = useState<FitMode>("fit")

  const handleApplyTemplate = (template: (typeof socialMediaTemplates)[0]) => {
    if (!canvas) return

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
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">Social Media Templates</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Select a template to resize your canvas
        </p>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-medium">Fit Mode</h4>
        <Tabs
          value={fitMode}
          onValueChange={(value) => setFitMode(value as FitMode)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fit">Fit</TabsTrigger>
            <TabsTrigger value="fill">Fill</TabsTrigger>
            <TabsTrigger value="crop">Crop</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-muted-foreground mt-2 text-xs">
          {fitMode === "fit" &&
            "Resize canvas to template size (preserves image)"}
          {fitMode === "fill" &&
            "Scale image to fill template (may show borders)"}
          {fitMode === "crop" && "Crop image to exact template dimensions"}
        </p>
      </div>

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
