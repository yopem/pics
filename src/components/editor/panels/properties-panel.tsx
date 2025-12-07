"use client"

import { useState } from "react"

import { useEditor } from "@/components/editor/editor-context"
import { HistoryPanel } from "@/components/editor/panels/history-panel"
import { BackgroundRemovalTool } from "@/components/editor/tools/background-removal-tool"
import { CropTool } from "@/components/editor/tools/crop-tool"
import { FaviconTool } from "@/components/editor/tools/favicon-tool"
import { FilterPanel } from "@/components/editor/tools/filter-panel"
import { TemplateTool } from "@/components/editor/tools/template-tool"
import { TextTool } from "@/components/editor/tools/text-tool"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
          {activeTool === "crop" && <CropTool />}
          {activeTool === "filter" && <FilterPanel />}
          {activeTool === "background" && <BackgroundRemovalTool />}
          {activeTool === "text" && <TextTool />}
          {activeTool === "template" && <TemplateTool />}
          {activeTool === "favicon" && <FaviconTool />}
          {activeTool === "select" && (
            <div className="text-muted-foreground text-sm">
              Select a tool to see its options
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="history"
          className="flex-1 overflow-auto"
          role="tabpanel"
        >
          <HistoryPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
