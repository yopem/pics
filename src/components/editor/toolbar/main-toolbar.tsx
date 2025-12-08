"use client"

import { lazy, Suspense, useRef, useState } from "react"
import { Image as FabricImage } from "fabric"
import {
  Download,
  FlipHorizontal,
  FlipVertical,
  Loader2,
  Maximize2,
  Redo2,
  RotateCcw,
  RotateCw,
  Save,
  Undo2,
  Upload,
} from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import ThemeSwitcher from "@/components/theme/theme-switcher"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  canvasDimensionPresets,
  type CanvasDimensionPreset,
} from "@/lib/editor/canvas-presets"

const ExportDialog = lazy(() =>
  import("@/components/editor/export-dialog").then((mod) => ({
    default: mod.ExportDialog,
  })),
)
const KeyboardShortcutsDialog = lazy(() =>
  import("@/components/editor/keyboard-shortcuts-dialog").then((mod) => ({
    default: mod.KeyboardShortcutsDialog,
  })),
)

export function MainToolbar() {
  const {
    canvas,
    projectId,
    undo,
    redo,
    saveProject,
    historyIndex,
    history,
    addToHistory,
    isSaving,
  } = useEditor()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [canvasPresetOpen, setCanvasPresetOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] =
    useState<CanvasDimensionPreset["category"]>("common")

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleExport = () => {
    setExportDialogOpen(true)
  }

  const handleApplyCanvasPreset = (preset: CanvasDimensionPreset) => {
    if (!canvas) return

    canvas.setDimensions({
      width: preset.width,
      height: preset.height,
    })
    canvas.renderAll()

    const state = JSON.stringify(canvas.toJSON())
    addToHistory(state)

    setCanvasPresetOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !canvas) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const imgUrl = event.target?.result as string
      const img = await FabricImage.fromURL(imgUrl)

      const maxWidth = canvas.width || 800
      const maxHeight = canvas.height || 600

      if (img.width && img.height) {
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
        img.scale(scale)
      }

      canvas.add(img)
      canvas.centerObject(img)
      canvas.setActiveObject(img)
      canvas.renderAll()

      const state = JSON.stringify(canvas.toJSON())
      addToHistory(state)
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRotate = (degrees: number) => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject) return

    const currentAngle = activeObject.angle || 0
    activeObject.rotate(currentAngle + degrees)
    canvas.renderAll()

    const state = JSON.stringify(canvas.toJSON())
    addToHistory(state)
  }

  const handleFlip = (direction: "horizontal" | "vertical") => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject) return

    if (direction === "horizontal") {
      activeObject.set("flipX", !activeObject.flipX)
    } else {
      activeObject.set("flipY", !activeObject.flipY)
    }
    canvas.renderAll()

    const state = JSON.stringify(canvas.toJSON())
    addToHistory(state)
  }

  return (
    <div
      className="border-border bg-background flex h-14 items-center gap-2 border-b px-4"
      role="toolbar"
      aria-label="Main editor toolbar"
    >
      <h1 className="text-sm font-semibold">Yopem Pics Editor</h1>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <Button
        size="sm"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Upload image"
      >
        <Upload className="size-4" />
        Upload
      </Button>

      <Popover open={canvasPresetOpen} onOpenChange={setCanvasPresetOpen}>
        <PopoverTrigger>
          <Button size="sm" variant="outline" aria-label="Change canvas size">
            <Maximize2 className="size-4" />
            Canvas
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Canvas Dimensions</h3>
              <p className="text-muted-foreground text-xs">
                Select a preset size for your canvas
              </p>
            </div>
            <Tabs
              value={selectedCategory}
              onValueChange={(value) =>
                setSelectedCategory(value as CanvasDimensionPreset["category"])
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="common" className="text-xs">
                  Common
                </TabsTrigger>
                <TabsTrigger value="screen" className="text-xs">
                  Screen
                </TabsTrigger>
                <TabsTrigger value="print" className="text-xs">
                  Print
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="max-h-64 space-y-1.5 overflow-y-auto">
              {canvasDimensionPresets
                .filter((preset) => preset.category === selectedCategory)
                .map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyCanvasPreset(preset)}
                    className="w-full justify-start"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-medium">{preset.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {preset.width} × {preset.height}
                      </span>
                    </div>
                  </Button>
                ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div
        className="flex items-center gap-1"
        role="group"
        aria-label="Transform actions"
      >
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => handleRotate(-90)}
          title="Rotate Left 90°"
          aria-label="Rotate left 90 degrees"
        >
          <RotateCcw className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => handleRotate(90)}
          title="Rotate Right 90°"
          aria-label="Rotate right 90 degrees"
        >
          <RotateCw className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => handleFlip("horizontal")}
          title="Flip Horizontal"
          aria-label="Flip horizontal"
        >
          <FlipHorizontal className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => handleFlip("vertical")}
          title="Flip Vertical"
          aria-label="Flip vertical"
        >
          <FlipVertical className="size-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <div
        className="flex items-center gap-1"
        role="group"
        aria-label="History actions"
      >
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo last action"
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo last action"
        >
          <Redo2 className="size-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <div
        className="ml-auto flex items-center gap-2"
        role="group"
        aria-label="File actions"
      >
        <ThemeSwitcher />
        <Suspense fallback={null}>
          <KeyboardShortcutsDialog />
        </Suspense>
        <Button
          size="sm"
          variant="outline"
          onClick={() => saveProject()}
          disabled={isSaving}
          aria-label="Save project"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" onClick={handleExport} aria-label="Export image">
          <Download className="size-4" />
          Export
        </Button>
      </div>

      <Suspense fallback={null}>
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          canvasDataUrl={canvas?.toDataURL() ?? null}
          projectId={projectId}
        />
      </Suspense>

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
