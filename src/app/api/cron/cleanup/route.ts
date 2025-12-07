import "server-only"

import { NextResponse, type NextRequest } from "next/server"

import { cronSecret } from "@/lib/env/server"
import { cleanupOldTempFiles } from "@/lib/storage/temp"

/**
 * Cron job to clean up temporary files older than 24 hours
 * This route should be called periodically by a cron service (e.g., Vercel Cron)
 *
 * Security: Check for authorization header to prevent unauthorized access
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await cleanupOldTempFiles()

    return NextResponse.json({
      success: true,
      message: "Temporary files cleanup completed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron job error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
