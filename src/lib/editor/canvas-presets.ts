export interface CanvasDimensionPreset {
  id: string
  name: string
  width: number
  height: number
  category: "common" | "screen" | "print" | "custom"
}

export const canvasDimensionPresets: CanvasDimensionPreset[] = [
  // Common digital sizes
  {
    id: "hd",
    name: "HD (1920×1080)",
    width: 1920,
    height: 1080,
    category: "common",
  },
  {
    id: "fullhd",
    name: "Full HD (1920×1080)",
    width: 1920,
    height: 1080,
    category: "common",
  },
  {
    id: "4k",
    name: "4K (3840×2160)",
    width: 3840,
    height: 2160,
    category: "common",
  },
  {
    id: "square-sm",
    name: "Square Small (800×800)",
    width: 800,
    height: 800,
    category: "common",
  },
  {
    id: "square-md",
    name: "Square Medium (1200×1200)",
    width: 1200,
    height: 1200,
    category: "common",
  },
  {
    id: "square-lg",
    name: "Square Large (2400×2400)",
    width: 2400,
    height: 2400,
    category: "common",
  },

  // Screen sizes
  {
    id: "desktop-sm",
    name: "Desktop Small (1366×768)",
    width: 1366,
    height: 768,
    category: "screen",
  },
  {
    id: "desktop-md",
    name: "Desktop Medium (1920×1080)",
    width: 1920,
    height: 1080,
    category: "screen",
  },
  {
    id: "desktop-lg",
    name: "Desktop Large (2560×1440)",
    width: 2560,
    height: 1440,
    category: "screen",
  },
  {
    id: "mobile-portrait",
    name: "Mobile Portrait (375×667)",
    width: 375,
    height: 667,
    category: "screen",
  },
  {
    id: "mobile-landscape",
    name: "Mobile Landscape (667×375)",
    width: 667,
    height: 375,
    category: "screen",
  },
  {
    id: "tablet-portrait",
    name: "Tablet Portrait (768×1024)",
    width: 768,
    height: 1024,
    category: "screen",
  },
  {
    id: "tablet-landscape",
    name: "Tablet Landscape (1024×768)",
    width: 1024,
    height: 768,
    category: "screen",
  },

  // Print sizes (in pixels at 300 DPI)
  {
    id: "a4-portrait",
    name: "A4 Portrait (2480×3508)",
    width: 2480,
    height: 3508,
    category: "print",
  },
  {
    id: "a4-landscape",
    name: "A4 Landscape (3508×2480)",
    width: 3508,
    height: 2480,
    category: "print",
  },
  {
    id: "letter-portrait",
    name: "Letter Portrait (2550×3300)",
    width: 2550,
    height: 3300,
    category: "print",
  },
  {
    id: "letter-landscape",
    name: "Letter Landscape (3300×2550)",
    width: 3300,
    height: 2550,
    category: "print",
  },
]

export function getPresetsByCategory(
  category: CanvasDimensionPreset["category"],
): CanvasDimensionPreset[] {
  return canvasDimensionPresets.filter((preset) => preset.category === category)
}

export function getPresetById(id: string): CanvasDimensionPreset | undefined {
  return canvasDimensionPresets.find((preset) => preset.id === id)
}
