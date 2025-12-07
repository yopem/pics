"use client"

import { useRef, useState } from "react"
import { Image as FabricImage } from "fabric"
import { Download, Redo2, Save, Undo2, Upload } from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import { ExportDialog } from "@/components/editor/export-dialog"
import { KeyboardShortcutsDialog } from "@/components/editor/keyboard-shortcuts-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleExport = () => {
    setExportDialogOpen(true)
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
        <KeyboardShortcutsDialog />
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

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        canvasDataUrl={canvas?.toDataURL() ?? null}
        projectId={projectId}
      />

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
