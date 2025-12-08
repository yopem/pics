export type AnalyticsEvent =
  | "editor_page_view"
  | "tool_selected"
  | "project_created"
  | "project_saved"
  | "project_exported"
  | "filter_applied"
  | "background_removed"
  | "template_applied"
  | "favicon_generated"
  | "custom_template_saved"
  | "custom_preset_saved"

interface AnalyticsProperties {
  tool?: string
  format?: string
  template?: string
  [key: string]: string | number | boolean | undefined
}

export function trackEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties,
): void {
  if (typeof window === "undefined") return

  try {
    console.info(`[Analytics] ${event}`, properties)

    if (window.gtag) {
      window.gtag("event", event, properties)
    }

    if (window.umami) {
      window.umami.track(event, properties)
    }
  } catch (error) {
    console.error("Failed to track analytics event:", error)
  }
}

export function trackPageView(path: string, title?: string): void {
  if (typeof window === "undefined") return

  try {
    console.info(`[Analytics] page_view: ${path}`)

    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: path,
        page_title: title,
      })
    }

    if (window.umami) {
      window.umami.track("pageview", { url: path, title })
    }
  } catch (error) {
    console.error("Failed to track page view:", error)
  }
}

declare global {
  interface Window {
    gtag?: (
      command: string,
      event: string,
      params?: Record<string, unknown>,
    ) => void
    umami?: {
      track: (
        event: string,
        data?: Record<string, string | number | boolean | undefined>,
      ) => void
    }
  }
}
