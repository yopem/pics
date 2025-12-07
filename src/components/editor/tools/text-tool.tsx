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
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">Add Text</h3>
        <Button onClick={handleAddText} className="w-full">
          Add Text Box
        </Button>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-medium">Font Family</h3>
        <div className="grid grid-cols-2 gap-2">
          {FONT_FAMILIES.map((family) => (
            <Button
              key={family}
              variant={fontFamily === family ? "default" : "outline"}
              size="sm"
              onClick={() => handleFontFamilyChange(family)}
              className="text-xs"
            >
              {family}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium">Font Size</label>
          <span className="text-muted-foreground text-xs">{fontSize}px</span>
        </div>
        <Slider
          value={fontSize}
          onValueChange={handleFontSizeChange}
          min={8}
          max={120}
          step={1}
        />
      </div>

      <Separator />

      <div>
        <label className="mb-2 block text-xs font-medium">Text Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={textColor}
            onChange={handleColorChange}
            className="h-10 w-full cursor-pointer rounded border"
          />
          <span className="text-muted-foreground text-xs">{textColor}</span>
        </div>
      </div>
    </div>
  )
}
