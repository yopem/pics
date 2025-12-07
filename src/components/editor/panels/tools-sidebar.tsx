"use client"

import {
  Crop,
  Filter,
  Image,
  Image as ImageIcon,
  Layout,
  Type,
} from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function ToolsSidebar() {
  const { activeTool, setActiveTool } = useEditor()

  const tools = [
    { id: "crop" as const, icon: Crop, label: "Crop" },
    { id: "filter" as const, icon: Filter, label: "Filters" },
    { id: "background" as const, icon: ImageIcon, label: "Background" },
    { id: "text" as const, icon: Type, label: "Text" },
    { id: "template" as const, icon: Layout, label: "Templates" },
    { id: "favicon" as const, icon: Image, label: "Favicon" },
  ]

  return (
    <div
      className="border-border bg-muted/30 flex w-16 flex-col items-center gap-1 border-r py-4"
      role="toolbar"
      aria-label="Editor tools"
    >
      {tools.map((tool, index) => (
        <div key={tool.id}>
          {index === 3 && <Separator className="my-2 w-8" />}
          <Button
            size="icon-sm"
            variant={activeTool === tool.id ? "default" : "ghost"}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            aria-label={tool.label}
            aria-pressed={activeTool === tool.id}
          >
            <tool.icon className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
