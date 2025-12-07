import { randomUUID } from "crypto"
import { removeBackground } from "@imgly/background-removal-node"
import { TRPCError } from "@trpc/server"
import sharp from "sharp"
import toIco from "to-ico"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/lib/api/trpc"
import { saveTempFile } from "@/lib/storage/temp"
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit"

export const editorRouter = createTRPCRouter({
  removeBackground: protectedProcedure
    .input(
      z.object({
        imageData: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rateLimitKey = `bg-removal:${ctx.session.email}`
      const rateLimit = checkRateLimit(
        rateLimitKey,
        RATE_LIMITS.BACKGROUND_REMOVAL,
      )

      if (!rateLimit.allowed) {
        const resetInSeconds = Math.ceil(
          (rateLimit.resetAt - Date.now()) / 1000,
        )
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
        })
      }

      try {
        const base64Data = input.imageData.replace(
          /^data:image\/\w+;base64,/,
          "",
        )
        const buffer = Buffer.from(base64Data, "base64")

        const resultBlob = await removeBackground(buffer)
        const resultBuffer = Buffer.from(await resultBlob.arrayBuffer())

        const imageId = randomUUID()
        const filePath = await saveTempFile(
          ctx.session.id,
          imageId,
          "png",
          resultBuffer,
        )

        const base64Result = resultBuffer.toString("base64")
        return {
          success: true,
          dataUrl: `data:image/png;base64,${base64Result}`,
          filePath,
        }
      } catch (error) {
        console.error("Background removal failed:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove background",
        })
      }
    }),

  generateFavicons: protectedProcedure
    .input(
      z.object({
        imageData: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const base64Data = input.imageData.replace(
          /^data:image\/\w+;base64,/,
          "",
        )
        const buffer = Buffer.from(base64Data, "base64")

        const favicons: { name: string; data: string; size: number }[] = []

        const pngSizes = [16, 32, 180, 192, 512]
        for (const size of pngSizes) {
          const resized = await sharp(buffer)
            .resize(size, size, {
              fit: "contain",
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png()
            .toBuffer()

          const base64 = resized.toString("base64")
          let name = `favicon-${size}.png`
          if (size === 180) name = "apple-touch-icon.png"
          if (size === 192) name = "android-chrome-192.png"
          if (size === 512) name = "android-chrome-512.png"

          favicons.push({
            name,
            data: `data:image/png;base64,${base64}`,
            size,
          })
        }

        const ico32 = await sharp(buffer)
          .resize(32, 32, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer()

        const icoBuffer = await toIco([ico32])
        const icoBase64 = icoBuffer.toString("base64")

        favicons.push({
          name: "favicon.ico",
          data: `data:image/x-icon;base64,${icoBase64}`,
          size: 32,
        })

        return {
          success: true,
          favicons,
        }
      } catch (error) {
        console.error("Favicon generation failed:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate favicons",
        })
      }
    }),

  exportImage: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        imageData: z.string(),
        format: z.enum(["png", "jpg", "webp"]),
        quality: z.number().min(1).max(100).optional().default(90),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rateLimitKey = `export:${ctx.session.email}`
      const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.EXPORT)

      if (!rateLimit.allowed) {
        const resetInSeconds = Math.ceil(
          (rateLimit.resetAt - Date.now()) / 1000,
        )
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
        })
      }

      try {
        const base64Data = input.imageData.replace(
          /^data:image\/\w+;base64,/,
          "",
        )
        const buffer = Buffer.from(base64Data, "base64")

        let processedBuffer: Buffer

        if (input.format === "png") {
          processedBuffer = await sharp(buffer)
            .png({ quality: input.quality })
            .toBuffer()
        } else if (input.format === "jpg") {
          processedBuffer = await sharp(buffer)
            .jpeg({ quality: input.quality })
            .toBuffer()
        } else {
          processedBuffer = await sharp(buffer)
            .webp({ quality: input.quality })
            .toBuffer()
        }

        const imageId = randomUUID()
        await saveTempFile(
          ctx.session.id,
          imageId,
          input.format,
          processedBuffer,
        )

        const base64Result = processedBuffer.toString("base64")
        const mimeType =
          input.format === "png"
            ? "image/png"
            : input.format === "jpg"
              ? "image/jpeg"
              : "image/webp"

        return {
          success: true,
          dataUrl: `data:${mimeType};base64,${base64Result}`,
          filename: `export-${Date.now()}.${input.format}`,
        }
      } catch (error) {
        console.error("Export failed:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export image",
        })
      }
    }),
})
