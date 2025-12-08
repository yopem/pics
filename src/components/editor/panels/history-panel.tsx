"use client"

import { Clock, Redo, Undo } from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export function HistoryPanel() {
  const { history, historyIndex, undo, redo, jumpToState } = useEditor()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const handleJumpToState = (index: number) => {
    jumpToState(index)
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">History</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          View and navigate through your editing history
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="flex-1"
          aria-label="Undo last action"
        >
          <Undo className="mr-2 h-4 w-4" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="flex-1"
          aria-label="Redo next action"
        >
          <Redo className="mr-2 h-4 w-4" />
          Redo
        </Button>
      </div>

      <Separator />

      <div className="flex-1">
        <h4 className="mb-2 text-xs font-medium">
          History States ({history.length}/50)
        </h4>
        <ScrollArea className="h-full">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-xs">No history yet</p>
            </div>
          ) : (
            <div className="relative space-y-1">
              <div className="bg-border absolute top-0 bottom-0 left-4 w-0.5" />
              {history.map((entry, index) => {
                const isCurrent = index === historyIndex
                const isFuture = index > historyIndex

                return (
                  <button
                    key={entry.timestamp}
                    onClick={() => handleJumpToState(index)}
                    disabled={isCurrent}
                    className={`relative w-full rounded-md px-3 py-2 text-left text-xs transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground cursor-default"
                        : isFuture
                          ? "bg-muted/50 text-muted-foreground hover:bg-muted/70 cursor-pointer"
                          : "bg-muted hover:bg-muted/80 cursor-pointer"
                    }`}
                    aria-label={`Jump to state ${index + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`z-10 h-2 w-2 rounded-full ${
                          isCurrent
                            ? "bg-primary-foreground"
                            : isFuture
                              ? "bg-muted-foreground"
                              : "bg-primary"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">State {index + 1}</span>
                          <span className="text-xs opacity-75">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                        {isCurrent && (
                          <div className="mt-1 text-xs opacity-75">
                            Current State
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      <Separator />

      <div className="text-muted-foreground text-xs">
        <p>
          <strong>Keyboard Shortcuts:</strong>
        </p>
        <p>Ctrl/Cmd + Z: Undo</p>
        <p>Ctrl/Cmd + Y: Redo</p>
        <p>Ctrl/Cmd + Shift + Z: Redo</p>
        <p className="mt-2 text-xs opacity-75">Click any state to jump to it</p>
      </div>
    </div>
  )
}
