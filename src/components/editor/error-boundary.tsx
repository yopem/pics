"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Editor error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = "/editor"
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md text-center">
            <AlertTriangle className="text-destructive mx-auto mb-4 h-16 w-16" />
            <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              The editor encountered an unexpected error. Don't worry, your
              project data is safe.
            </p>
            {this.state.error && (
              <div className="bg-muted mb-6 rounded-lg p-4 text-left">
                <p className="mb-1 text-sm font-medium">Error details:</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex justify-center gap-3">
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button variant="outline" onClick={this.handleReset}>
                Back to Editor
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
