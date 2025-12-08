export function isOnline(): boolean {
  return navigator.onLine
}

export function setupOfflineDetection(
  onOffline: () => void,
  onOnline: () => void,
) {
  window.addEventListener("offline", onOffline)
  window.addEventListener("online", onOnline)

  return () => {
    window.removeEventListener("offline", onOffline)
    window.removeEventListener("online", onOnline)
  }
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<T> {
  let lastError: Error = new Error("Unknown error")

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch") ||
      error.name === "NetworkError"
    )
  }
  return false
}
