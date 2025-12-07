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

export function generateHTMLSnippet(appName: string): string {
  return `<!-- Favicon -->
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
