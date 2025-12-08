"use client"

import { useEffect, useState } from "react"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  id?: string
}

const MAX_RECENT_COLORS = 12
const STORAGE_KEY = "yopem-pics-recent-colors"

function getRecentColors(): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Failed to load recent colors:", error)
    return []
  }
}

function saveRecentColor(color: string) {
  if (typeof window === "undefined") return
  try {
    const recent = getRecentColors()
    const filtered = recent.filter((c) => c !== color)
    const updated = [color, ...filtered].slice(0, MAX_RECENT_COLORS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Failed to save recent color:", error)
  }
}

export function ColorPicker({ value, onChange, label, id }: ColorPickerProps) {
  const [recentColors, setRecentColors] = useState<string[]>([])

  useEffect(() => {
    setRecentColors(getRecentColors())
  }, [])

  const handleColorChange = (newColor: string) => {
    onChange(newColor)
    saveRecentColor(newColor)
    setRecentColors(getRecentColors())
  }

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2 block text-xs font-medium">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          className="h-10 w-20 cursor-pointer rounded border"
          aria-label={label ?? "Choose color"}
        />
        <span className="text-muted-foreground text-xs" aria-live="polite">
          {value}
        </span>
      </div>
      {recentColors.length > 0 && (
        <div className="mt-3">
          <p className="text-muted-foreground mb-2 text-xs">Recent Colors</p>
          <div className="flex flex-wrap gap-2">
            {recentColors.map((color) => (
              <button
                key={color}
                onClick={() => onChange(color)}
                className="border-border hover:border-primary size-8 cursor-pointer rounded border-2 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
