"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import {
  downloadAsFile,
  generateHTMLSnippet,
  generateWebManifest,
} from "@/lib/editor/favicon-generator"
import { useTRPC } from "@/lib/trpc/client"

const FAVICON_SIZES = [
  { name: "favicon.ico", size: 32, format: "ico" as const },
  { name: "favicon-16.png", size: 16, format: "png" as const },
  { name: "favicon-32.png", size: 32, format: "png" as const },
  { name: "apple-touch-icon.png", size: 180, format: "png" as const },
  { name: "android-chrome-192.png", size: 192, format: "png" as const },
  { name: "android-chrome-512.png", size: 512, format: "png" as const },
]

export function FaviconTool() {
  const { canvas } = useEditor()
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    FAVICON_SIZES.map((s) => s.name),
  )
  const [generateFormat, setGenerateFormat] = useState<"all" | "png" | "ico">(
    "all",
  )

  const trpc = useTRPC()
  const generateFaviconsMutation = useMutation(
    trpc.editor.generateFavicons.mutationOptions(),
  )

  const handleSetCanvasSize = () => {
    if (!canvas) return
    canvas.setDimensions({ width: 512, height: 512 })
    canvas.renderAll()
  }

  const toggleSize = (sizeName: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeName)
        ? prev.filter((s) => s !== sizeName)
        : [...prev, sizeName],
    )
  }

  const toggleAll = () => {
    if (selectedSizes.length === FAVICON_SIZES.length) {
      setSelectedSizes([])
    } else {
      setSelectedSizes(FAVICON_SIZES.map((s) => s.name))
    }
  }

  const handleGenerateFavicons = async () => {
    if (!canvas) return

    try {
      const dataUrl = canvas.toDataURL()

      const result = await generateFaviconsMutation.mutateAsync({
        imageData: dataUrl,
      })

      result.favicons
        .filter((favicon) => {
          if (generateFormat === "all")
            return selectedSizes.includes(favicon.name)
          if (generateFormat === "png")
            return (
              selectedSizes.includes(favicon.name) &&
              favicon.name.endsWith(".png")
            )
          return (
            selectedSizes.includes(favicon.name) &&
            favicon.name.endsWith(".ico")
          )
        })
        .forEach((favicon) => {
          const link = document.createElement("a")
          link.href = favicon.data
          link.download = favicon.name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })

      const manifest = generateWebManifest(
        "My App",
        "App",
        "#ffffff",
        "#ffffff",
      )
      downloadAsFile(
        JSON.stringify(manifest, null, 2),
        "manifest.json",
        "application/json",
      )

      const htmlSnippet = generateHTMLSnippet("My App")
      downloadAsFile(htmlSnippet, "favicon-snippet.html", "text/html")
    } catch (error) {
      console.error("Failed to generate favicons:", error)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">Favicon Generator</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Generate all required favicon sizes from your design
        </p>
      </div>

      <Button onClick={handleSetCanvasSize} variant="outline">
        Set Canvas to 512×512
      </Button>

      <Separator />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-medium">Format</h4>
        </div>
        <div className="flex gap-2">
          <Button
            variant={generateFormat === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setGenerateFormat("all")}
          >
            All
          </Button>
          <Button
            variant={generateFormat === "png" ? "default" : "outline"}
            size="sm"
            onClick={() => setGenerateFormat("png")}
          >
            PNG
          </Button>
          <Button
            variant={generateFormat === "ico" ? "default" : "outline"}
            size="sm"
            onClick={() => setGenerateFormat("ico")}
          >
            ICO
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-medium">Sizes to Generate</h4>
          <Button onClick={toggleAll} variant="ghost" size="sm">
            {selectedSizes.length === FAVICON_SIZES.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </div>
        <div className="space-y-2">
          {FAVICON_SIZES.map((size) => (
            <div
              key={size.name}
              className="flex items-center justify-between gap-2"
            >
              <Toggle
                pressed={selectedSizes.includes(size.name)}
                onPressedChange={() => toggleSize(size.name)}
                size="sm"
                className="flex-1 justify-start"
              >
                <span className="text-xs">{size.name}</span>
              </Toggle>
              <span className="text-muted-foreground text-xs">
                {size.size}×{size.size}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <Button
        onClick={handleGenerateFavicons}
        disabled={
          generateFaviconsMutation.isPending || selectedSizes.length === 0
        }
      >
        {generateFaviconsMutation.isPending
          ? "Generating..."
          : "Generate & Download"}
      </Button>

      <div className="text-muted-foreground mt-2 text-xs">
        <p className="mb-1 font-medium">Tips:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Use simple, recognizable icons</li>
          <li>Avoid fine details that won't scale well</li>
          <li>Test at 16×16 size for clarity</li>
          <li>Use high contrast colors</li>
        </ul>
      </div>
    </div>
  )
}
