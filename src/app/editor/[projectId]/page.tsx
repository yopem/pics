"use client"

import { use } from "react"

import { EditorCanvas } from "@/components/editor/canvas/editor-canvas"
import { EditorProvider, useEditor } from "@/components/editor/editor-context"
import { MobileWarning } from "@/components/editor/mobile-warning"
import { PropertiesPanel } from "@/components/editor/panels/properties-panel"
import { StatusBar } from "@/components/editor/panels/status-bar"
import { ToolsSidebar } from "@/components/editor/panels/tools-sidebar"
import { MainToolbar } from "@/components/editor/toolbar/main-toolbar"

function EditorLayout() {
  const { showLeftSidebar, showRightSidebar } = useEditor()

  return (
    <>
      <MobileWarning />
      <div className="flex h-full flex-col">
        <MainToolbar />
        <div className="flex flex-1 overflow-hidden">
          {showLeftSidebar && <ToolsSidebar />}
          <div className="flex flex-1 flex-col">
            <EditorCanvas />
            <StatusBar />
          </div>
          {showRightSidebar && <PropertiesPanel />}
        </div>
      </div>
    </>
  )
}

export default function EditorProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)

  return (
    <EditorProvider projectId={projectId}>
      <EditorLayout />
    </EditorProvider>
  )
}
