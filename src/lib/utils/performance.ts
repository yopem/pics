/**
 * Performance utilities for the image editor
 */

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit function execution rate
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Request idle callback fallback for browsers that don't support it
 */
export const requestIdleCallback =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback) => setTimeout(callback, 1)

/**
 * Cancel idle callback fallback
 */
export const cancelIdleCallback =
  typeof window !== "undefined" && "cancelIdleCallback" in window
    ? window.cancelIdleCallback
    : (id: number) => clearTimeout(id)

/**
 * Optimize image dimensions for processing
 * Downscales images larger than maxDimension while maintaining aspect ratio
 */
export function optimizeImageDimensions(
  width: number,
  height: number,
  maxDimension = 2048,
): { width: number; height: number; scale: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height, scale: 1 }
  }

  const aspectRatio = width / height

  if (width > height) {
    const newWidth = maxDimension
    const newHeight = Math.round(maxDimension / aspectRatio)
    return { width: newWidth, height: newHeight, scale: newWidth / width }
  }

  const newHeight = maxDimension
  const newWidth = Math.round(maxDimension * aspectRatio)
  return { width: newWidth, height: newHeight, scale: newHeight / height }
}

/**
 * Memory efficient history state management
 * Ensures history doesn't exceed size limits
 */
export function pruneHistoryStates<T>(
  states: T[],
  maxStates = 50,
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
): T[] {
  if (states.length <= maxStates) {
    const totalSize = JSON.stringify(states).length
    if (totalSize <= maxSizeBytes) {
      return states
    }
  }

  const prunedStates = states.slice(-maxStates)

  const totalSize = JSON.stringify(prunedStates).length
  if (totalSize <= maxSizeBytes) {
    return prunedStates
  }

  const ratio = maxSizeBytes / totalSize
  const targetCount = Math.floor(maxStates * ratio)

  return states.slice(-Math.max(10, targetCount))
}

/**
 * Check if device has limited resources
 */
export function hasLimitedResources(): boolean {
  if (typeof navigator === "undefined") return false

  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory

  if (memory && memory < 4) return true

  const cores = navigator.hardwareConcurrency
  if (cores && cores < 4) return true

  return false
}

/**
 * Get recommended canvas dimensions based on device capabilities
 */
export function getRecommendedCanvasDimensions(): {
  max: number
  default: number
} {
  const limited = hasLimitedResources()

  return {
    max: limited ? 2048 : 4096,
    default: limited ? 1024 : 2048,
  }
}

/**
 * Check if image should be downscaled for performance
 */
export function shouldDownscaleImage(width: number, height: number): boolean {
  const { max } = getRecommendedCanvasDimensions()
  return width > max || height > max
}

/**
 * Downscale image to target dimensions while maintaining quality
 */
export async function downscaleImage(
  imageUrl: string,
  targetMaxDimension?: number,
): Promise<string> {
  const maxDimension =
    targetMaxDimension ?? getRecommendedCanvasDimensions().max

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const { width, height } = img

      if (width <= maxDimension && height <= maxDimension) {
        resolve(imageUrl)
        return
      }

      const scale = Math.min(maxDimension / width, maxDimension / height)

      const newWidth = Math.floor(width * scale)
      const newHeight = Math.floor(height * scale)

      const canvas = document.createElement("canvas")
      canvas.width = newWidth
      canvas.height = newHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Failed to get canvas context"))
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"))
            return
          }

          const reader = new FileReader()
          reader.onload = () => {
            resolve(reader.result as string)
          }
          reader.onerror = () => {
            reject(new Error("Failed to read blob"))
          }
          reader.readAsDataURL(blob)
        },
        "image/png",
        0.95,
      )
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    img.src = imageUrl
  })
}
