"use client"

import { useState } from "react"
import { filters as fabricFilters, FabricImage } from "fabric"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"

interface FilterValues {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  hue: number
  sharpen: number
}

const DEFAULT_FILTERS: FilterValues = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  hue: 0,
  sharpen: 0,
}

const FILTER_PRESETS = [
  {
    name: "None",
    values: DEFAULT_FILTERS,
  },
  {
    name: "Vivid",
    values: { ...DEFAULT_FILTERS, saturation: 0.3, contrast: 0.1 },
  },
  {
    name: "B&W",
    values: { ...DEFAULT_FILTERS, saturation: -1 },
  },
  {
    name: "Sepia",
    values: {
      ...DEFAULT_FILTERS,
      hue: 0.08,
      saturation: -0.2,
      brightness: 0.1,
    },
  },
  {
    name: "Vintage",
    values: {
      ...DEFAULT_FILTERS,
      hue: 0.08,
      saturation: -0.2,
      contrast: 0.1,
      brightness: -0.05,
    },
  },
  {
    name: "Cold",
    values: { ...DEFAULT_FILTERS, hue: -0.15, saturation: -0.1 },
  },
  {
    name: "High Contrast",
    values: { ...DEFAULT_FILTERS, contrast: 0.3, brightness: 0.1 },
  },
  {
    name: "Bright",
    values: { ...DEFAULT_FILTERS, brightness: 0.2 },
  },
  {
    name: "Dark",
    values: { ...DEFAULT_FILTERS, brightness: -0.2 },
  },
]

export function FilterPanel() {
  const { canvas, addToHistory } = useEditor()
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS)

  const handleFilterChange = (
    key: keyof FilterValues,
    value: number | readonly number[],
  ) => {
    const numValue = Array.isArray(value) ? value[0] : value
    const newFilters = { ...filters, [key]: numValue }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const applyFilters = (filterValues: FilterValues) => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject || !(activeObject instanceof FabricImage)) return

    const filterArray = []

    if (filterValues.brightness !== 0) {
      filterArray.push(
        new fabricFilters.Brightness({ brightness: filterValues.brightness }),
      )
    }

    if (filterValues.contrast !== 0) {
      filterArray.push(
        new fabricFilters.Contrast({ contrast: filterValues.contrast }),
      )
    }

    if (filterValues.saturation !== 0) {
      filterArray.push(
        new fabricFilters.Saturation({ saturation: filterValues.saturation }),
      )
    }

    if (filterValues.blur !== 0) {
      filterArray.push(new fabricFilters.Blur({ blur: filterValues.blur }))
    }

    if (filterValues.hue !== 0) {
      filterArray.push(
        new fabricFilters.HueRotation({ rotation: filterValues.hue }),
      )
    }

    if (filterValues.sharpen !== 0) {
      const matrix = [
        0,
        -1 * filterValues.sharpen,
        0,
        -1 * filterValues.sharpen,
        1 + 4 * filterValues.sharpen,
        -1 * filterValues.sharpen,
        0,
        -1 * filterValues.sharpen,
        0,
      ]
      filterArray.push(new fabricFilters.Convolute({ matrix }))
    }

    activeObject.filters = filterArray
    activeObject.applyFilters()
    canvas.renderAll()

    const state = JSON.stringify(canvas.toJSON())
    addToHistory(state)
  }

  const handlePreset = (preset: (typeof FILTER_PRESETS)[0]) => {
    setFilters(preset.values)
    applyFilters(preset.values)
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    applyFilters(DEFAULT_FILTERS)
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">Presets</h3>
        <div className="grid grid-cols-3 gap-2">
          {FILTER_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => handlePreset(preset)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium">Brightness</label>
            <span className="text-muted-foreground text-xs">
              {filters.brightness.toFixed(2)}
            </span>
          </div>
          <Slider
            value={filters.brightness}
            onValueChange={(v) => handleFilterChange("brightness", v)}
            min={-1}
            max={1}
            step={0.01}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium">Contrast</label>
            <span className="text-muted-foreground text-xs">
              {filters.contrast.toFixed(2)}
            </span>
          </div>
          <Slider
            value={filters.contrast}
            onValueChange={(v) => handleFilterChange("contrast", v)}
            min={-1}
            max={1}
            step={0.01}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium">Saturation</label>
            <span className="text-muted-foreground text-xs">
              {filters.saturation.toFixed(2)}
            </span>
          </div>
          <Slider
            value={filters.saturation}
            onValueChange={(v) => handleFilterChange("saturation", v)}
            min={-1}
            max={1}
            step={0.01}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium">Blur</label>
            <span className="text-muted-foreground text-xs">
              {filters.blur.toFixed(2)}
            </span>
          </div>
          <Slider
            value={filters.blur}
            onValueChange={(v) => handleFilterChange("blur", v)}
            min={0}
            max={1}
            step={0.01}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium">Hue</label>
            <span className="text-muted-foreground text-xs">
              {filters.hue.toFixed(2)}
            </span>
          </div>
          <Slider
            value={filters.hue}
            onValueChange={(v) => handleFilterChange("hue", v)}
            min={-1}
            max={1}
            step={0.01}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium">Sharpen</label>
            <span className="text-muted-foreground text-xs">
              {filters.sharpen.toFixed(2)}
            </span>
          </div>
          <Slider
            value={filters.sharpen}
            onValueChange={(v) => handleFilterChange("sharpen", v)}
            min={0}
            max={1}
            step={0.01}
          />
        </div>
      </div>

      <Separator />

      <Button variant="outline" onClick={handleReset}>
        Reset All
      </Button>
    </div>
  )
}
