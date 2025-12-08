export interface WebManifest {
  name: string
  short_name: string
  icons: {
    src: string
    sizes: string
    type: string
    purpose?: string
  }[]
  theme_color: string
  background_color: string
  display: string
}

export function generateWebManifest(
  appName: string,
  shortName: string,
  themeColor = "#ffffff",
  backgroundColor = "#ffffff",
): WebManifest {
  return {
    name: appName,
    short_name: shortName,
    icons: [
      {
        src: "/android-chrome-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/android-chrome-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    theme_color: themeColor,
    background_color: backgroundColor,
    display: "standalone",
  }
}

export function generateHTMLSnippet(
  appName: string,
  includeSvg = false,
): string {
  const svgLink = includeSvg
    ? '\n<link rel="icon" type="image/svg+xml" href="/favicon.svg">'
    : ""

  return `<!-- Favicon -->${svgLink}
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android Chrome -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512.png">

<!-- Web App Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- Theme Color -->
<meta name="theme-color" content="#ffffff">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${appName}">
`
}

export function downloadAsFile(
  content: string,
  filename: string,
  mimeType = "text/plain",
) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function canvasToOptimizedSvg(canvas: HTMLCanvasElement): string {
  const width = canvas.width
  const height = canvas.height
  const dataUrl = canvas.toDataURL("image/png")

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" xlink:href="${dataUrl}"/>
</svg>`

  return optimizeSvg(svg)
}

/**
 * Optimize SVG markup by:
 * - Removing unnecessary whitespace
 * - Minifying attributes
 * - Removing comments
 * - Rounding decimal precision
 */
function optimizeSvg(svg: string): string {
  return (
    svg
      // Remove XML comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove unnecessary whitespace between tags
      .replace(/>\s+</g, "><")
      // Collapse multiple spaces to single space
      .replace(/\s+/g, " ")
      // Round decimal values to 2 places for smaller file size
      .replace(/(\d+\.\d{3,})/g, (match) => {
        return parseFloat(match).toFixed(2)
      })
      // Remove spaces around equal signs in attributes
      .replace(/\s*=\s*/g, "=")
      // Trim leading/trailing whitespace
      .trim()
  )
}
