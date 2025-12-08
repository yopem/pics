"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import JSZip from "jszip"

import { useEditor } from "@/components/editor/editor-context"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle"
import {
  canvasToOptimizedSvg,
  generateHTMLSnippet,
  generateWebManifest,
} from "@/lib/editor/favicon-generator"
import { useTRPC } from "@/lib/trpc/client"

const FAVICON_SIZES = [
  { name: "favicon.svg", size: null, format: "svg" as const },
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
  const [generateFormat, setGenerateFormat] = useState<
    "all" | "png" | "ico" | "svg"
  >("all")
  const [appName, setAppName] = useState("My App")
  const [shortName, setShortName] = useState("App")
  const [themeColor, setThemeColor] = useState("#ffffff")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)

  const trpc = useTRPC()
  const generateFaviconsMutation = useMutation(
    trpc.editor.generateFavicons.mutationOptions(),
  )

  const handleSetCanvasSize = () => {
    if (!canvas) return
    canvas.setDimensions({ width: 512, height: 512 })
    canvas.renderAll()
    updatePreview()
  }

  const updatePreview = () => {
    if (!canvas) return
    const dataUrl = canvas.toDataURL()
    setPreviewDataUrl(dataUrl)
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

      // Create a ZIP file
      const zip = new JSZip()

      // Add SVG favicon if selected
      if (selectedSizes.includes("favicon.svg")) {
        const fabricCanvas = canvas as unknown as {
          getElement: () => HTMLCanvasElement
        }
        const canvasElement = fabricCanvas.getElement()
        const svgContent = canvasToOptimizedSvg(canvasElement)
        zip.file("favicon.svg", svgContent)
      }

      // Add favicon files
      const faviconFiles = result.favicons.filter((favicon) => {
        if (generateFormat === "all")
          return selectedSizes.includes(favicon.name)
        if (generateFormat === "svg") return false
        if (generateFormat === "png")
          return (
            selectedSizes.includes(favicon.name) &&
            favicon.name.endsWith(".png")
          )
        return (
          selectedSizes.includes(favicon.name) && favicon.name.endsWith(".ico")
        )
      })

      faviconFiles.forEach((favicon) => {
        const base64Data = favicon.data.split(",")[1]
        zip.file(favicon.name, base64Data, { base64: true })
      })

      // Add manifest.json
      const manifest = generateWebManifest(
        appName,
        shortName,
        themeColor,
        backgroundColor,
      )
      zip.file("manifest.json", JSON.stringify(manifest, null, 2))

      // Add HTML snippet
      const htmlSnippet = generateHTMLSnippet(
        appName,
        selectedSizes.includes("favicon.svg"),
      )
      zip.file("favicon-snippet.html", htmlSnippet)

      // Add README with instructions
      const readme = `# Favicon Package

This package contains all the necessary files for your website's favicon.

## Files Included

${faviconFiles.map((f) => `- ${f.name}`).join("\n")}
- manifest.json
- favicon-snippet.html

## Installation Instructions

1. Copy all favicon files to your website's root directory or /public folder.

2. Add the following code to your HTML <head> section:
   (See favicon-snippet.html for the complete snippet)

3. Update your manifest.json if you already have one, or include the provided one.

4. For Next.js/React projects:
   - Place favicon files in the /public folder
   - Import in your layout or _document file

5. Test your favicons:
   - Clear browser cache
   - Visit your website
   - Check different devices and browsers

## Customization

You can edit manifest.json to customize:
- name: Full application name
- short_name: Short name (max 12 characters)
- theme_color: Browser theme color
- background_color: Splash screen background

## Browser Support

- favicon.ico: All browsers
- PNG favicons: Modern browsers
- apple-touch-icon: iOS Safari
- android-chrome: Android Chrome

Generated with Yopem Pics Image Editor
`
      zip.file("README.md", readme)

      // Generate and download ZIP
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${shortName.toLowerCase().replace(/\s+/g, "-")}-favicons.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
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

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          {/* Web Manifest Fields */}
          <div>
            <h4 className="mb-2 text-xs font-medium">App Information</h4>
            <div className="space-y-2">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs">
                  App Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
                  placeholder="My Awesome App"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs">
                  Short Name
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
                  placeholder="App"
                  maxLength={12}
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Max 12 characters
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ColorPicker
                  value={themeColor}
                  onChange={setThemeColor}
                  label="Theme Color"
                />
                <ColorPicker
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                  label="Background Color"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Format Selection */}
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
                variant={generateFormat === "svg" ? "default" : "outline"}
                size="sm"
                onClick={() => setGenerateFormat("svg")}
              >
                SVG
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

          {/* Sizes Selection */}
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
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div>
            <h4 className="mb-2 text-xs font-medium">Browser Preview</h4>
            <p className="text-muted-foreground mb-3 text-xs">
              Preview how your favicon will look in different contexts
            </p>
          </div>

          <div className="space-y-4 rounded-md border p-4">
            {/* Browser Tab Preview */}
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Browser Tab
              </p>
              <div className="bg-muted flex items-center gap-2 rounded-md p-2">
                {previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDataUrl}
                    alt="Favicon preview"
                    className="h-4 w-4"
                  />
                ) : (
                  <div className="bg-background h-4 w-4 rounded" />
                )}
                <span className="text-sm">{appName}</span>
              </div>
            </div>

            {/* Bookmark Bar Preview */}
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Bookmark Bar
              </p>
              <div className="bg-muted flex items-center gap-2 rounded-md p-2">
                {previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDataUrl}
                    alt="Favicon preview"
                    className="h-5 w-5"
                  />
                ) : (
                  <div className="bg-background h-5 w-5 rounded" />
                )}
                <span className="text-xs">{shortName}</span>
              </div>
            </div>

            {/* iOS Home Screen Preview */}
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                iOS Home Screen (180×180)
              </p>
              <div className="flex items-center gap-2">
                {previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDataUrl}
                    alt="iOS icon preview"
                    className="h-16 w-16 rounded-xl"
                  />
                ) : (
                  <div className="bg-background h-16 w-16 rounded-xl border" />
                )}
                <div>
                  <p className="text-sm font-medium">{appName}</p>
                  <p className="text-muted-foreground text-xs">Tap to open</p>
                </div>
              </div>
            </div>

            {/* Android Home Screen Preview */}
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Android Home Screen (192×192)
              </p>
              <div className="flex items-center gap-2">
                {previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDataUrl}
                    alt="Android icon preview"
                    className="h-16 w-16 rounded-lg"
                  />
                ) : (
                  <div className="bg-background h-16 w-16 rounded-lg border" />
                )}
                <div>
                  <p className="text-sm font-medium">{appName}</p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={updatePreview} variant="outline" className="w-full">
            Refresh Preview
          </Button>
        </TabsContent>
      </Tabs>

      <Separator />

      <Button
        onClick={handleGenerateFavicons}
        disabled={
          generateFaviconsMutation.isPending || selectedSizes.length === 0
        }
      >
        {generateFaviconsMutation.isPending
          ? "Generating..."
          : "Generate & Download ZIP"}
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
