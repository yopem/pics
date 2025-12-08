"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { FabricImage, Rect } from "fabric"
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react"

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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle"
import { socialMediaTemplates } from "@/lib/editor/templates"
import { useTRPC } from "@/lib/trpc/client"

const CATEGORIES = [
  "My Templates",
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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templatePlatform, setTemplatePlatform] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  const trpc = useTRPC()
  const customTemplatesQuery = useQuery(
    trpc.customTemplates.list.queryOptions(),
  )
  const createMutation = useMutation(
    trpc.customTemplates.create.mutationOptions(),
  )
  const deleteMutation = useMutation(
    trpc.customTemplates.delete.mutationOptions(),
  )

  const customTemplates = customTemplatesQuery.data ?? []

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

  const handleApplyTemplate = (
    template:
      | (typeof socialMediaTemplates)[0]
      | {
          name: string
          platform: string
          width: number
          height: number
          safeZone?: {
            top: number
            bottom: number
            left: number
            right: number
          } | null
        },
  ) => {
    if (!canvas) return

    setCurrentTemplate(null)

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

  const handleSaveAsTemplate = () => {
    setSaveDialogOpen(true)
  }

  const handleConfirmSave = async () => {
    if (!canvas || !templateName.trim() || !templatePlatform.trim()) return

    try {
      const thumbnail = canvas.toDataURL({
        format: "png",
        quality: 0.8,
        multiplier: 0.2,
      })

      await createMutation.mutateAsync({
        name: templateName.trim(),
        platform: templatePlatform.trim(),
        width: canvas.width || 800,
        height: canvas.height || 600,
        thumbnail,
      })

      await customTemplatesQuery.refetch()
      setSaveDialogOpen(false)
      setTemplateName("")
      setTemplatePlatform("")
    } catch (error) {
      console.error("Failed to save template:", error)
    }
  }

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return

    try {
      await deleteMutation.mutateAsync({ id: templateToDelete })
      await customTemplatesQuery.refetch()
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    } catch (error) {
      console.error("Failed to delete template:", error)
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
        <Button
          onClick={handleSaveAsTemplate}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Save Current as Template
        </Button>
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
          category === "My Templates"
            ? customTemplates.map((t) => ({
                name: t.name,
                platform: t.platform,
                width: t.width,
                height: t.height,
                safeZone: t.safeZone,
              }))
            : category === "All"
              ? socialMediaTemplates
              : socialMediaTemplates.filter((t) => t.platform === category)

        if (category === "My Templates" && customTemplates.length === 0) {
          return null
        }

        return (
          <div key={category}>
            <h4 className="mb-2 text-xs font-medium">{category}</h4>
            <div className="space-y-2">
              {templates.map((template, index) => {
                const isCustom = category === "My Templates"
                const customTemplate = isCustom ? customTemplates[index] : null

                return (
                  <div key={template.name} className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyTemplate(template)}
                      className="flex-1 justify-start"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-xs">{template.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {template.width} × {template.height}
                        </span>
                      </div>
                    </Button>
                    {isCustom && customTemplate && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(customTemplate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
            {category !== CATEGORIES[CATEGORIES.length - 1] && (
              <Separator className="my-3" />
            )}
          </div>
        )
      })}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
            <DialogDescription>
              Save your current canvas size as a reusable template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., My Instagram Post"
                className="border-input bg-background placeholder:text-muted-foreground focus:ring-primary h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Platform/Category
              </label>
              <input
                type="text"
                value={templatePlatform}
                onChange={(e) => setTemplatePlatform(e.target.value)}
                placeholder="e.g., Instagram, Custom"
                className="border-input bg-background placeholder:text-muted-foreground focus:ring-primary h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSave}
              disabled={
                createMutation.isPending ||
                !templateName.trim() ||
                !templatePlatform.trim()
              }
            >
              {createMutation.isPending ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
