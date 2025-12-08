"use client"

import { lazy, Suspense, useRef, useState } from "react"
import { Image as FabricImage } from "fabric"
import { Download, Maximize2, Redo2, Save, Undo2, Upload } from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
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
        <Suspense fallback={null}>
          <KeyboardShortcutsDialog />
        </Suspense>
        <Button
          size="sm"
          variant="outline"
          onClick={() => saveProject()}
          aria-label="Save project"
        >
          <Save className="size-4" />
          Save
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
