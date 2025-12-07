"use client"

import { Command, Keyboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface ShortcutItem {
  keys: string[]
  description: string
  category: string
}

const shortcuts: ShortcutItem[] = [
  { keys: ["Ctrl/Cmd", "Z"], description: "Undo", category: "Editing" },
  { keys: ["Ctrl/Cmd", "Y"], description: "Redo", category: "Editing" },
  {
    keys: ["Ctrl/Cmd", "Shift", "Z"],
    description: "Redo (alternative)",
    category: "Editing",
  },
  { keys: ["Ctrl/Cmd", "S"], description: "Save project", category: "File" },
  { keys: ["Tab"], description: "Toggle sidebars", category: "View" },
]

function KeyBadge({ label }: { label: string }) {
  return (
    <kbd className="border-border bg-muted rounded border px-2 py-1 font-mono text-xs">
      {label}
    </kbd>
  )
}

export function KeyboardShortcutsDialog() {
  const categories = Array.from(new Set(shortcuts.map((s) => s.category)))
  const groupedShortcuts: Record<string, ShortcutItem[]> = {}

  for (const category of categories) {
    groupedShortcuts[category] = shortcuts.filter(
      (s) => s.category === category,
    )
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="icon-sm" variant="ghost" title="Keyboard Shortcuts" />
        }
      >
        <Keyboard className="size-4" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-6 pb-6">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-3 text-sm font-semibold">{category}</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
                  >
                    <span className="text-sm">{item.description}</span>
                    <div className="flex gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <span
                          key={keyIndex}
                          className="flex items-center gap-1"
                        >
                          <KeyBadge label={key} />
                          {keyIndex < item.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {category !==
                Object.keys(groupedShortcuts)[
                  Object.keys(groupedShortcuts).length - 1
                ] && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
