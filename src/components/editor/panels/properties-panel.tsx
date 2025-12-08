"use client"

import { lazy, Suspense, useState } from "react"

import { useEditor } from "@/components/editor/editor-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const HistoryPanel = lazy(() =>
  import("@/components/editor/panels/history-panel").then((mod) => ({
    default: mod.HistoryPanel,
  })),
)
const BackgroundRemovalTool = lazy(() =>
  import("@/components/editor/tools/background-removal-tool").then((mod) => ({
    default: mod.BackgroundRemovalTool,
  })),
)
const CanvasResizeTool = lazy(() =>
  import("@/components/editor/tools/canvas-resize-tool").then((mod) => ({
    default: mod.CanvasResizeTool,
  })),
)
const CropTool = lazy(() =>
  import("@/components/editor/tools/crop-tool").then((mod) => ({
    default: mod.CropTool,
  })),
)
const FaviconTool = lazy(() =>
  import("@/components/editor/tools/favicon-tool").then((mod) => ({
    default: mod.FaviconTool,
  })),
)
const FilterPanel = lazy(() =>
  import("@/components/editor/tools/filter-panel").then((mod) => ({
    default: mod.FilterPanel,
  })),
)
const TemplateTool = lazy(() =>
  import("@/components/editor/tools/template-tool").then((mod) => ({
    default: mod.TemplateTool,
  })),
)
const TextTool = lazy(() =>
  import("@/components/editor/tools/text-tool").then((mod) => ({
    default: mod.TextTool,
  })),
)

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div
          className="border-muted border-t-primary mx-auto mb-2 size-8 animate-spin rounded-full border-2"
          aria-hidden="true"
        />
        <p className="text-muted-foreground text-xs">Loading...</p>
      </div>
    </div>
  )
}

export function PropertiesPanel() {
  const { activeTool } = useEditor()
  const [activeTab, setActiveTab] = useState<"properties" | "history">(
    "properties",
  )

  return (
    <div
      className="border-border bg-background flex w-80 flex-col border-l"
      role="complementary"
      aria-label="Properties and history panel"
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "properties" | "history")
        }
        className="flex h-full flex-col"
      >
        <div className="border-border border-b px-4 pt-4">
          <TabsList
            className="grid w-full grid-cols-2"
            role="tablist"
            aria-label="Panel tabs"
          >
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="properties"
          className="flex-1 overflow-auto p-4"
          role="tabpanel"
        >
          <Suspense fallback={<LoadingFallback />}>
            {activeTool === "crop" && <CropTool />}
            {activeTool === "filter" && <FilterPanel />}
            {activeTool === "background" && <BackgroundRemovalTool />}
            {activeTool === "text" && <TextTool />}
            {activeTool === "template" && <TemplateTool />}
            {activeTool === "favicon" && <FaviconTool />}
            {activeTool === "resize" && <CanvasResizeTool />}
            {activeTool === "select" && (
              <div className="text-muted-foreground text-sm">
                Select a tool to see its options
              </div>
            )}
          </Suspense>
        </TabsContent>

        <TabsContent
          value="history"
          className="flex-1 overflow-auto"
          role="tabpanel"
        >
          <Suspense fallback={<LoadingFallback />}>
            <HistoryPanel />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
