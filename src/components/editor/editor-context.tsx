"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import type { Canvas } from "fabric"

import type { SelectProject } from "@/lib/db/schema"
import { useTRPC } from "@/lib/trpc/client"
import { setupOfflineDetection } from "@/lib/utils/network"

type ActiveTool =
  | "select"
  | "crop"
  | "filter"
  | "background"
  | "text"
  | "template"
  | "favicon"
  | "resize"

interface HistoryEntry {
  canvasState: string
  timestamp: number
}

interface EditorContextValue {
  canvas: Canvas | null
  setCanvas: (canvas: Canvas | null) => void
  projectId: string
  currentProject: SelectProject | null
  isLoadingProject: boolean
  isSaving: boolean
  activeTool: ActiveTool
  setActiveTool: (tool: ActiveTool) => void
  history: HistoryEntry[]
  historyIndex: number
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
  undo: () => void
  redo: () => void
  jumpToState: (index: number) => void
  addToHistory: (state: string) => void
  saveProject: () => Promise<void>
  showLeftSidebar: boolean
  showRightSidebar: boolean
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  isOffline: boolean
}

const EditorContext = createContext<EditorContextValue | null>(null)

const MAX_HISTORY = 50

export function EditorProvider({
  children,
  projectId,
}: {
  children: React.ReactNode
  projectId: string
}) {
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [currentProject, setCurrentProject] = useState<SelectProject | null>(
    null,
  )
  const [activeTool, setActiveTool] = useState<ActiveTool>("select")
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isDirty, setIsDirty] = useState(false)
  const [showLeftSidebar, setShowLeftSidebar] = useState(true)
  const [showRightSidebar, setShowRightSidebar] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const autoSaveTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  const trpc = useTRPC()

  const { data: projectData, isLoading: isLoadingProject } = useQuery({
    ...trpc.projects.get.queryOptions({ id: projectId }),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const saveVersionMutation = useMutation(
    trpc.projects.saveVersion.mutationOptions(),
  )

  const claimEditLockMutation = useMutation(
    trpc.projects.claimEditLock.mutationOptions(),
  )

  const releaseEditLockMutation = useMutation(
    trpc.projects.releaseEditLock.mutationOptions(),
  )

  const refreshEditLockMutation = useMutation(
    trpc.projects.refreshEditLock.mutationOptions(),
  )

  const addToHistory = useCallback(
    (state: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push({
          canvasState: state,
          timestamp: Date.now(),
        })

        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift()
          return newHistory
        }

        return newHistory
      })
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1))
      setIsDirty(true)
    },
    [historyIndex],
  )

  const undo = useCallback(() => {
    if (!canvas || historyIndex <= 0) return

    const newIndex = historyIndex - 1
    const state = history[newIndex]

    void canvas.loadFromJSON(state.canvasState, () => {
      canvas.renderAll()
    })
    setHistoryIndex(newIndex)
    setIsDirty(true)
  }, [canvas, history, historyIndex])

  const redo = useCallback(() => {
    if (!canvas || historyIndex >= history.length - 1) return

    const newIndex = historyIndex + 1
    const state = history[newIndex]

    void canvas.loadFromJSON(state.canvasState, () => {
      canvas.renderAll()
    })
    setHistoryIndex(newIndex)
    setIsDirty(true)
  }, [canvas, history, historyIndex])

  const jumpToState = useCallback(
    (index: number) => {
      if (!canvas || index < 0 || index >= history.length) return

      const state = history[index]

      void canvas.loadFromJSON(state.canvasState, () => {
        canvas.renderAll()
      })
      setHistoryIndex(index)
      setIsDirty(true)
    },
    [canvas, history],
  )

  const saveProject = useCallback(async () => {
    if (!canvas || !isDirty) return

    try {
      const canvasState = canvas.toJSON()

      await saveVersionMutation.mutateAsync({
        projectId,
        canvasState,
      })

      setIsDirty(false)
    } catch (error) {
      console.error("Failed to save project:", error)
    }
  }, [canvas, isDirty, projectId, saveVersionMutation])

  const toggleLeftSidebar = useCallback(() => {
    setShowLeftSidebar((prev) => !prev)
  }, [])

  const toggleRightSidebar = useCallback(() => {
    setShowRightSidebar((prev) => !prev)
  }, [])

  useEffect(() => {
    const cleanup = setupOfflineDetection(
      () => setIsOffline(true),
      () => setIsOffline(false),
    )
    setIsOffline(!navigator.onLine)
    return cleanup
  }, [])

  useEffect(() => {
    if (isDirty) {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current)
      }

      autoSaveTimeout.current = setTimeout(() => {
        void saveProject()
      }, 30000)
    }

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current)
      }
    }
  }, [isDirty, saveProject])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault()
          undo()
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault()
          redo()
        } else if (e.key === "s") {
          e.preventDefault()
          void saveProject()
        } else if (e.key === "[" && canvas) {
          e.preventDefault()
          const activeObject = canvas.getActiveObject()
          if (activeObject) {
            const currentAngle = activeObject.angle || 0
            activeObject.rotate(currentAngle - 90)
            canvas.renderAll()
            const state = JSON.stringify(canvas.toJSON())
            addToHistory(state)
          }
        } else if (e.key === "]" && canvas) {
          e.preventDefault()
          const activeObject = canvas.getActiveObject()
          if (activeObject) {
            const currentAngle = activeObject.angle || 0
            activeObject.rotate(currentAngle + 90)
            canvas.renderAll()
            const state = JSON.stringify(canvas.toJSON())
            addToHistory(state)
          }
        } else if (e.altKey && canvas) {
          if (e.key === "1") {
            e.preventDefault()
            canvas.setDimensions({ width: 1920, height: 1080 })
            canvas.renderAll()
            const state = JSON.stringify(canvas.toJSON())
            addToHistory(state)
          } else if (e.key === "2") {
            e.preventDefault()
            canvas.setDimensions({ width: 3840, height: 2160 })
            canvas.renderAll()
            const state = JSON.stringify(canvas.toJSON())
            addToHistory(state)
          } else if (e.key === "3") {
            e.preventDefault()
            canvas.setDimensions({ width: 1200, height: 1200 })
            canvas.renderAll()
            const state = JSON.stringify(canvas.toJSON())
            addToHistory(state)
          }
        }
      } else if (e.key === "Tab") {
        e.preventDefault()
        toggleLeftSidebar()
        toggleRightSidebar()
      } else if (e.key === "h" && canvas) {
        e.preventDefault()
        const activeObject = canvas.getActiveObject()
        if (activeObject) {
          if (e.shiftKey) {
            activeObject.set("flipY", !activeObject.flipY)
          } else {
            activeObject.set("flipX", !activeObject.flipX)
          }
          canvas.renderAll()
          const state = JSON.stringify(canvas.toJSON())
          addToHistory(state)
        }
      } else if (e.key === "H" && canvas) {
        e.preventDefault()
        const activeObject = canvas.getActiveObject()
        if (activeObject) {
          activeObject.set("flipY", !activeObject.flipY)
          canvas.renderAll()
          const state = JSON.stringify(canvas.toJSON())
          addToHistory(state)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    undo,
    redo,
    saveProject,
    toggleLeftSidebar,
    toggleRightSidebar,
    canvas,
    addToHistory,
  ])

  useEffect(() => {
    if (projectData && canvas) {
      setCurrentProject(projectData)

      const versions = "versions" in projectData ? projectData.versions : []

      if (versions.length > 0 && versions[0]) {
        const latestVersion = versions[0]
        const canvasState = latestVersion.canvasState

        if (canvasState) {
          void canvas.loadFromJSON(canvasState, () => {
            canvas.renderAll()

            const state = JSON.stringify(canvasState)
            setHistory([
              {
                canvasState: state,
                timestamp: Date.now(),
              },
            ])
            setHistoryIndex(0)
          })
        }
      }
    }
  }, [projectData, canvas])

  useEffect(() => {
    if (!projectId) return

    let lockRefreshInterval: NodeJS.Timeout | undefined

    const claimLock = async () => {
      try {
        await claimEditLockMutation.mutateAsync({ projectId })

        lockRefreshInterval = setInterval(
          () => {
            void refreshEditLockMutation
              .mutateAsync({ projectId })
              .catch((error) =>
                console.error("Failed to refresh edit lock:", error),
              )
          },
          2 * 60 * 1000,
        )
      } catch (error) {
        console.error("Failed to claim edit lock:", error)
      }
    }

    void claimLock()

    return () => {
      if (lockRefreshInterval) {
        clearInterval(lockRefreshInterval)
      }

      void releaseEditLockMutation
        .mutateAsync({ projectId })
        .catch((error) => console.error("Failed to release edit lock:", error))
    }
  }, [
    projectId,
    claimEditLockMutation,
    refreshEditLockMutation,
    releaseEditLockMutation,
  ])

  const value: EditorContextValue = {
    canvas,
    setCanvas,
    projectId,
    currentProject,
    isLoadingProject,
    isSaving: saveVersionMutation.isPending,
    activeTool,
    setActiveTool,
    history,
    historyIndex,
    isDirty,
    setIsDirty,
    undo,
    redo,
    jumpToState,
    addToHistory,
    saveProject,
    showLeftSidebar,
    showRightSidebar,
    toggleLeftSidebar,
    toggleRightSidebar,
    isOffline,
  }

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider")
  }
  return context
}
