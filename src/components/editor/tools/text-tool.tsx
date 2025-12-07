"use client"

import { useState } from "react"
import { Textbox } from "fabric"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
]

export function TextTool() {
  const { canvas } = useEditor()
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [textColor, setTextColor] = useState("#000000")

  const handleAddText = () => {
    if (!canvas) return

    const text = new Textbox("Double click to edit", {
      left: 100,
      top: 100,
      fontSize,
      fontFamily,
      fill: textColor,
      width: 200,
    })

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  const handleFontSizeChange = (value: number | readonly number[]) => {
    const size = Array.isArray(value) ? value[0] : value
    setFontSize(size)

    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type === "textbox") {
      activeObject.set("fontSize", size)
      canvas.renderAll()
    }
  }

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family)

    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type === "textbox") {
      activeObject.set("fontFamily", family)
      canvas.renderAll()
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setTextColor(color)

    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type === "textbox") {
      activeObject.set("fill", color)
      canvas.renderAll()
    }
  }

  return (
    <div
      className="flex h-full flex-col gap-4 p-4"
      role="region"
      aria-label="Text tool options"
    >
      <div>
        <h3 className="mb-3 text-sm font-medium">Add Text</h3>
        <Button
          onClick={handleAddText}
          className="w-full"
          aria-label="Add new text box to canvas"
        >
          Add Text Box
        </Button>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-medium" id="font-family-heading">
          Font Family
        </h3>
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-labelledby="font-family-heading"
        >
          {FONT_FAMILIES.map((family) => (
            <Button
              key={family}
              variant={fontFamily === family ? "default" : "outline"}
              size="sm"
              onClick={() => handleFontFamilyChange(family)}
              className="text-xs"
              aria-label={`Set font to ${family}`}
              aria-pressed={fontFamily === family}
            >
              {family}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="font-size-slider" className="text-xs font-medium">
            Font Size
          </label>
          <span className="text-muted-foreground text-xs" aria-live="polite">
            {fontSize}px
          </span>
        </div>
        <Slider
          id="font-size-slider"
          value={fontSize}
          onValueChange={handleFontSizeChange}
          min={8}
          max={120}
          step={1}
          aria-label="Font size"
        />
      </div>

      <Separator />

      <div>
        <label
          htmlFor="text-color-picker"
          className="mb-2 block text-xs font-medium"
        >
          Text Color
        </label>
        <div className="flex items-center gap-2">
          <input
            id="text-color-picker"
            type="color"
            value={textColor}
            onChange={handleColorChange}
            className="h-10 w-full cursor-pointer rounded border"
            aria-label="Choose text color"
          />
          <span className="text-muted-foreground text-xs" aria-live="polite">
            {textColor}
          </span>
        </div>
      </div>
    </div>
  )
}
