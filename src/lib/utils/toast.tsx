"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/style"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  message: string
  type: ToastType
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType,
    action?: Toast["action"],
  ) => void
  showError: (error: unknown, retry?: () => void) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

const toastIcons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

const toastStyles: Record<ToastType, string> = {
  success:
    "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
  error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
  warning:
    "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
  info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = "info", action?: Toast["action"]) => {
      const id = Math.random().toString(36).slice(2)
      const toast: Toast = { id, message, type, action }
      setToasts((prev) => [...prev, toast])

      setTimeout(() => {
        removeToast(id)
      }, 5000)
    },
    [removeToast],
  )

  const showError = useCallback(
    (error: unknown, retry?: () => void | Promise<void>) => {
      const message =
        error instanceof Error ? error.message : "An error occurred"

      const action = retry
        ? {
            label: "Retry",
            onClick: () => {
              void retry()
            },
          }
        : undefined

      showToast(message, "error", action)
    },
    [showToast],
  )

  return (
    <ToastContext.Provider value={{ showToast, showError }}>
      {children}
      <div className="pointer-events-none fixed right-0 bottom-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:top-auto sm:right-0 sm:max-w-md sm:flex-col">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all data-starting-style:translate-y-2 data-starting-style:opacity-0",
              toastStyles[toast.type],
            )}
          >
            <div className="flex-shrink-0">{toastIcons[toast.type]}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <div className="flex items-center gap-2">
              {toast.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toast.action.onClick}
                  className="h-7 px-2 text-xs"
                >
                  {toast.action.label}
                </Button>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
                aria-label="Close notification"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
