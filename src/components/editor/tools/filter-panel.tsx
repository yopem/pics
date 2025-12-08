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
import { useMutation, useQuery } from "@tanstack/react-query"
import { filters as fabricFilters, FabricImage } from "fabric"
import { Eye, EyeOff, GripVertical, Save, Trash2, X } from "lucide-react"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { useTRPC } from "@/lib/trpc/client"
import { useToast } from "@/lib/utils/toast"

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
  const [filterOrder, setFilterOrder] = useState<(keyof FilterValues)[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null)

  const { showToast, showError } = useToast()
  const trpc = useTRPC()
  const customPresetsQuery = useQuery(trpc.filterPresets.list.queryOptions())
  const createMutation = useMutation(
    trpc.filterPresets.create.mutationOptions(),
  )
  const deleteMutation = useMutation(
    trpc.filterPresets.delete.mutationOptions(),
  )

  const customPresets = customPresetsQuery.data ?? []

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
    customOrder?: (keyof FilterValues)[],
  ) => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject || !(activeObject instanceof FabricImage)) return

    if (!originalImageData) {
      const src = activeObject.getSrc()
      if (src && typeof src === "string") {
        setOriginalImageData(src)
      }
    }

    const filterArray = []

    const order =
      customOrder || filterOrder.length > 0
        ? filterOrder
        : (Object.keys(filterValues) as (keyof FilterValues)[])

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
        case "sharpen": {
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

  const handleCustomPreset = (preset: (typeof customPresets)[0]) => {
    const filterValues: FilterValues = { ...DEFAULT_FILTERS }

    for (const filter of preset.filters) {
      if (filter.type === "brightness" && typeof filter.value === "number") {
        filterValues.brightness = filter.value
      } else if (
        filter.type === "contrast" &&
        typeof filter.value === "number"
      ) {
        filterValues.contrast = filter.value
      } else if (
        filter.type === "saturation" &&
        typeof filter.value === "number"
      ) {
        filterValues.saturation = filter.value
      } else if (filter.type === "blur" && typeof filter.value === "number") {
        filterValues.blur = filter.value
      } else if (filter.type === "hue" && typeof filter.value === "number") {
        filterValues.hue = filter.value
      } else if (
        filter.type === "sharpen" &&
        typeof filter.value === "number"
      ) {
        filterValues.sharpen = filter.value
      }
    }

    setFilters(filterValues)
    applyFilters(filterValues)
  }

  const handleSavePreset = () => {
    setSaveDialogOpen(true)
  }

  const handleConfirmSave = async () => {
    if (!canvas || !presetName.trim()) return

    const hasActiveFilters = Object.values(filters).some((v) => v !== 0)
    if (!hasActiveFilters) return

    try {
      const filterArray = Object.entries(filters)
        .filter(([, value]) => value !== 0)
        .map(([key, value]) => ({
          type: key,
          value,
        }))

      const thumbnail = canvas.toDataURL({
        format: "png",
        quality: 0.8,
        multiplier: 0.2,
      })

      await createMutation.mutateAsync({
        name: presetName.trim(),
        filters: filterArray,
        thumbnail,
      })

      await customPresetsQuery.refetch()
      setSaveDialogOpen(false)
      setPresetName("")
      showToast("Filter preset saved successfully", "success")
    } catch (error) {
      showError(error, () => void handleConfirmSave())
    }
  }

  const handleDeleteClick = (presetId: string) => {
    setPresetToDelete(presetId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!presetToDelete) return

    try {
      await deleteMutation.mutateAsync({ id: presetToDelete })
      await customPresetsQuery.refetch()
      setDeleteDialogOpen(false)
      setPresetToDelete(null)
      showToast("Filter preset deleted successfully", "success")
    } catch (error) {
      showError(error, () => void handleConfirmDelete())
    }
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
    setFilterOrder(filterOrder.filter((k) => k !== key))
  }

  const toggleBeforeAfter = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (!activeObject || !(activeObject instanceof FabricImage)) return

    if (!showBeforeAfter) {
      activeObject.filters = []
      activeObject.applyFilters()
      canvas.renderAll()
    } else {
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

  if (activeFilters.length > 0 && filterOrder.length === 0) {
    const keys = activeFilters.map((f) => f.key)
    setFilterOrder(keys)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== 0)

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Presets</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSavePreset}
            disabled={!hasActiveFilters}
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save
          </Button>
        </div>
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
        {customPresets.length > 0 && (
          <>
            <h4 className="mt-3 mb-2 text-xs font-medium">My Presets</h4>
            <div className="space-y-1.5">
              {customPresets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomPreset(preset)}
                    className="flex-1 justify-start"
                  >
                    <span className="text-xs">{preset.name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(preset.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
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

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filter settings as a preset for quick access
              later.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Preset Name
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g., My Vintage Look"
              className="border-input bg-background placeholder:text-muted-foreground focus:ring-primary h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleConfirmSave()}
              disabled={createMutation.isPending || !presetName.trim()}
            >
              {createMutation.isPending ? "Saving..." : "Save Preset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Preset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this preset? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
