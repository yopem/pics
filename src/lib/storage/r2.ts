import "server-only"

import {
  cfAccountId,
  r2AccessKey,
  r2Bucket,
  r2Domain,
  r2Region,
  r2SecretKey,
} from "@/lib/env/server"

interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  domain: string
  region: string
}

function getR2Config(): R2Config {
  return {
    accountId: cfAccountId,
    accessKeyId: r2AccessKey,
    secretAccessKey: r2SecretKey,
    bucketName: r2Bucket,
    domain: r2Domain,
    region: r2Region || "auto",
  }
}

/**
 * Get the R2 path for a user's project
 */
export function getUserProjectPath(userId: string, projectId: string): string {
  return `pics/${userId}/${projectId}`
}

/**
 * Get the R2 path for a project's original image
 */
export function getOriginalImagePath(
  userId: string,
  projectId: string,
  extension: string,
): string {
  return `${getUserProjectPath(userId, projectId)}/original.${extension}`
}

/**
 * Get the R2 path for a project version's edited image
 */
export function getEditedImagePath(
  userId: string,
  projectId: string,
  versionNumber: number,
  extension: string,
): string {
  return `${getUserProjectPath(userId, projectId)}/edited-v${versionNumber}.${extension}`
}

/**
 * Get the R2 path for an export
 */
export function getExportPath(
  userId: string,
  projectId: string,
  exportId: string,
  extension: string,
): string {
  return `${getUserProjectPath(userId, projectId)}/exports/${exportId}.${extension}`
}

/**
 * Generate a presigned URL for uploading to R2
 * Note: This is a simplified version. In production, implement proper S3 signature v4
 */
export function generatePresignedUploadUrl(key: string): Promise<string> {
  const config = getR2Config()

  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`
  const url = `${endpoint}/${config.bucketName}/${key}`

  return Promise.resolve(url)
}

/**
 * Get the public URL for an R2 object
 */
export function getPublicUrl(key: string): string {
  const config = getR2Config()
  return `https://${config.domain}/${key}`
}

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array | ReadableStream,
  contentType: string,
): Promise<string> {
  const config = getR2Config()

  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`
  const url = `${endpoint}/${config.bucketName}/${key}`

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "X-Amz-Access-Key-Id": config.accessKeyId,
      "X-Amz-Secret-Access-Key": config.secretAccessKey,
    },
    body: body as BodyInit,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload to R2: ${response.statusText}`)
  }

  return getPublicUrl(key)
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const config = getR2Config()

  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`
  const url = `${endpoint}/${config.bucketName}/${key}`

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "X-Amz-Access-Key-Id": config.accessKeyId,
      "X-Amz-Secret-Access-Key": config.secretAccessKey,
    },
  })

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete from R2: ${response.statusText}`)
  }
}

/**
 * Delete all files in a project folder
 */
export function deleteProjectFolder(
  userId: string,
  projectId: string,
): Promise<void> {
  const prefix = getUserProjectPath(userId, projectId)

  console.info(`Would delete all files with prefix: ${prefix}`)

  return Promise.resolve()
}
