import piexif from "piexifjs"

export interface ExifMetadata {
  software?: string
  description?: string
  artist?: string
  copyright?: string
  userComment?: string
}

export function embedExifMetadata(
  imageDataUrl: string,
  metadata: ExifMetadata,
): string {
  try {
    if (!imageDataUrl.startsWith("data:image/jpeg")) {
      return imageDataUrl
    }

    const exifObj: Record<string, unknown> = {}

    if (metadata.software) {
      exifObj[piexif.ImageIFD.Software] = metadata.software
    }

    if (metadata.description) {
      exifObj[piexif.ImageIFD.ImageDescription] = metadata.description
    }

    if (metadata.artist) {
      exifObj[piexif.ImageIFD.Artist] = metadata.artist
    }

    if (metadata.copyright) {
      exifObj[piexif.ImageIFD.Copyright] = metadata.copyright
    }

    const exifDict = {
      "0th": exifObj,
      Exif: metadata.userComment
        ? {
            [piexif.ExifIFD.UserComment]: metadata.userComment,
          }
        : {},
    }

    const exifBytes = piexif.dump(exifDict)

    const newDataUrl = piexif.insert(exifBytes, imageDataUrl)

    return newDataUrl
  } catch (error) {
    console.error("Failed to embed EXIF metadata:", error)
    return imageDataUrl
  }
}

export function getDefaultExifMetadata(): ExifMetadata {
  return {
    software: "Yopem Pics Image Editor",
    description: "Created with Yopem Pics",
  }
}
