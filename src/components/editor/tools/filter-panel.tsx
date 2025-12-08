"use client"

import { useState } from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { filters as fabricFilters, FabricImage } from "fabric"
import { Eye, EyeOff, GripVertical, X } from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"

interface FilterValues {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  hue: number
  sharpen: number
}

interface ActiveFilter {
  key: keyof FilterValues
  label: string
  value: number
}

const DEFAULT_FILTERS: FilterValues = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  hue: 0,
  sharpen: 0,
}

const FILTER_LABELS: Record<keyof FilterValues, string> = {
  brightness: "Brightness",
  contrast: "Contrast",
  saturation: "Saturation",
  blur: "Blur",
  hue: "Hue Rotation",
  sharpen: "Sharpen",
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

interface SortableFilterItemProps {
  filter: ActiveFilter
  onRemove: (key: keyof FilterValues) => void
}

function SortableFilterItem({ filter, onRemove }: SortableFilterItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: filter.key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-muted flex items-center justify-between rounded-md px-2 py-1.5"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab touch-none active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium">{filter.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">
          {filter.value.toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(filter.key)}
          className="h-5 w-5"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function FilterPanel() {
  const { canvas, addToHistory } = useEditor()
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS)
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)
  const [originalImageData, setOriginalImageData] = useState<string | null>(
    null,
  )
  const [filterOrder, setFilterOrder] = useState<Array<keyof FilterValues>>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleFilterChange = (
    key: keyof FilterValues,
    value: number | readonly number[],
  ) => {
    const numValue = Array.isArray(value) ? value[0] : value
    const newFilters = { ...filters, [key]: numValue }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const applyFilters = (
    filterValues: FilterValues,
    customOrder?: Array<keyof FilterValues>,
  ) => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject || !(activeObject instanceof FabricImage)) return

    // Store original image data for before/after comparison
    if (!originalImageData) {
      const src = activeObject.getSrc()
      if (src && typeof src === "string") {
        setOriginalImageData(src)
      }
    }

    const filterArray = []

    // Apply filters in the order specified by filterOrder, or default order
    const order =
      customOrder || filterOrder.length > 0
        ? filterOrder
        : (Object.keys(filterValues) as Array<keyof FilterValues>)

    for (const key of order) {
      const value = filterValues[key]
      if (value === 0) continue

      switch (key) {
        case "brightness":
          filterArray.push(new fabricFilters.Brightness({ brightness: value }))
          break
        case "contrast":
          filterArray.push(new fabricFilters.Contrast({ contrast: value }))
          break
        case "saturation":
          filterArray.push(new fabricFilters.Saturation({ saturation: value }))
          break
        case "blur":
          filterArray.push(new fabricFilters.Blur({ blur: value }))
          break
        case "hue":
          filterArray.push(new fabricFilters.HueRotation({ rotation: value }))
          break
        case "sharpen":
          const matrix = [
            0,
            -1 * value,
            0,
            -1 * value,
            1 + 4 * value,
            -1 * value,
            0,
            -1 * value,
            0,
          ]
          filterArray.push(new fabricFilters.Convolute({ matrix }))
          break
      }
    }

    activeObject.filters = filterArray
    activeObject.applyFilters()
    canvas.renderAll()

    const state = JSON.stringify(canvas.toJSON())
    addToHistory(state)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = filterOrder.findIndex((key) => key === active.id)
    const newIndex = filterOrder.findIndex((key) => key === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(filterOrder, oldIndex, newIndex)
    setFilterOrder(newOrder)
    applyFilters(filters, newOrder)
  }

  const handlePreset = (preset: (typeof FILTER_PRESETS)[0]) => {
    setFilters(preset.values)
    applyFilters(preset.values)
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    applyFilters(DEFAULT_FILTERS)
    setOriginalImageData(null)
  }

  const handleRemoveFilter = (key: keyof FilterValues) => {
    const newFilters = { ...filters, [key]: 0 }
    setFilters(newFilters)
    applyFilters(newFilters)
    // Update filter order
    setFilterOrder(filterOrder.filter((k) => k !== key))
  }

  const toggleBeforeAfter = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (!activeObject || !(activeObject instanceof FabricImage)) return

    if (!showBeforeAfter) {
      // Show original
      activeObject.filters = []
      activeObject.applyFilters()
      canvas.renderAll()
    } else {
      // Show filtered
      applyFilters(filters)
    }

    setShowBeforeAfter(!showBeforeAfter)
  }

  const activeFilters: ActiveFilter[] = Object.entries(filters)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => ({
      key: key as keyof FilterValues,
      label: FILTER_LABELS[key as keyof FilterValues],
      value,
    }))

  // Update filter order when active filters change
  if (activeFilters.length > 0 && filterOrder.length === 0) {
    const keys = activeFilters.map((f) => f.key)
    setFilterOrder(keys)
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

      {activeFilters.length > 0 && (
        <>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-medium">Active Filters</h4>
              <Toggle
                size="sm"
                pressed={showBeforeAfter}
                onPressedChange={toggleBeforeAfter}
                aria-label="Toggle before/after view"
              >
                {showBeforeAfter ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Toggle>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filterOrder}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {activeFilters.map((filter) => (
                    <SortableFilterItem
                      key={filter.key}
                      filter={filter}
                      onRemove={handleRemoveFilter}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
          <Separator />
        </>
      )}

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
