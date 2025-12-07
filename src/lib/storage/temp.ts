import "server-only"

import { mkdir, readdir, rm, stat, writeFile } from "fs/promises"
import path from "path"

const TEMP_DIR = "/tmp/yopem-pics"
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Get the temporary directory path for a session
 */
export function getSessionTempDir(sessionId: string): string {
  return path.join(TEMP_DIR, sessionId)
}

/**
 * Get the path for a temporary file
 */
export function getTempFilePath(
  sessionId: string,
  imageId: string,
  extension: string,
): string {
  const timestamp = Date.now()
  return path.join(
    getSessionTempDir(sessionId),
    `${imageId}-${timestamp}.${extension}`,
  )
}

/**
 * Ensure the temporary directory exists
 */
export async function ensureTempDir(sessionId: string): Promise<string> {
  const dir = getSessionTempDir(sessionId)
  await mkdir(dir, { recursive: true })
  return dir
}

/**
 * Save a file to temporary storage
 */
export async function saveTempFile(
  sessionId: string,
  imageId: string,
  extension: string,
  data: Buffer,
): Promise<string> {
  await ensureTempDir(sessionId)
  const filePath = getTempFilePath(sessionId, imageId, extension)
  await writeFile(filePath, data)
  return filePath
}

/**
 * Clean up old temporary files (older than 24 hours)
 */
export async function cleanupOldTempFiles(): Promise<void> {
  try {
    // Ensure temp directory exists
    await mkdir(TEMP_DIR, { recursive: true })

    const sessions = await readdir(TEMP_DIR)
    const now = Date.now()

    for (const session of sessions) {
      const sessionDir = path.join(TEMP_DIR, session)

      try {
        const stats = await stat(sessionDir)

        if (!stats.isDirectory()) continue

        // Check if directory is older than 24 hours
        const age = now - stats.mtimeMs

        if (age > MAX_AGE_MS) {
          await rm(sessionDir, { recursive: true, force: true })
          console.info(`Cleaned up temp directory: ${sessionDir}`)
        }
      } catch (error) {
        console.error(`Error cleaning up ${sessionDir}:`, error)
      }
    }
  } catch (error) {
    console.error("Error during temp file cleanup:", error)
  }
}

/**
 * Delete a specific session's temporary files
 */
export async function deleteTempSession(sessionId: string): Promise<void> {
  const sessionDir = getSessionTempDir(sessionId)

  try {
    await rm(sessionDir, { recursive: true, force: true })
    console.info(`Deleted temp session: ${sessionId}`)
  } catch (error) {
    console.error(`Error deleting temp session ${sessionId}:`, error)
  }
}
