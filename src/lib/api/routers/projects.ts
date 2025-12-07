import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import z from "zod"

import { createTRPCRouter, protectedProcedure } from "@/lib/api/trpc"
import { projectsTable, projectVersionsTable } from "@/lib/db/schema"
import { deleteProjectFolder } from "@/lib/storage/r2"
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit"

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        thumbnail: z.string().optional(),
        originalImageUrl: z.string().optional(),
        metadata: z
          .object({
            width: z.number(),
            height: z.number(),
            format: z.string(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.id
        const [project] = await ctx.db
          .insert(projectsTable)
          .values({
            userId,
            name: input.name,
            status: input.status ?? "draft",
            thumbnail: input.thumbnail,
            originalImageUrl: input.originalImageUrl,
            metadata: input.metadata,
          })
          .returning()
        return project
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create project",
        })
      }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const projects = await ctx.db.query.projectsTable.findMany({
        where: (project, { eq }) => eq(project.userId, ctx.session.id),
        orderBy: (project, { desc }) => desc(project.updatedAt),
      })
      return projects
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to list projects",
      })
    }
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const project = await ctx.db.query.projectsTable.findFirst({
          where: (project, { and, eq }) =>
            and(eq(project.id, input.id), eq(project.userId, ctx.session.id)),
        })

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          })
        }

        const versions = await ctx.db.query.projectVersionsTable.findMany({
          where: (version, { eq }) => eq(version.projectId, input.id),
          orderBy: (version, { desc }) => desc(version.versionNumber),
        })

        return { ...project, versions }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to get project",
        })
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        thumbnail: z.string().optional(),
        originalImageUrl: z.string().optional(),
        metadata: z
          .object({
            width: z.number(),
            height: z.number(),
            format: z.string(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await ctx.db.query.projectsTable.findFirst({
          where: (project, { and, eq }) =>
            and(eq(project.id, input.id), eq(project.userId, ctx.session.id)),
        })

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          })
        }

        const [updatedProject] = await ctx.db
          .update(projectsTable)
          .set({
            name: input.name,
            status: input.status,
            thumbnail: input.thumbnail,
            originalImageUrl: input.originalImageUrl,
            metadata: input.metadata,
            updatedAt: new Date(),
          })
          .where(eq(projectsTable.id, input.id))
          .returning()

        return updatedProject
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update project",
        })
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await ctx.db.query.projectsTable.findFirst({
          where: (project, { and, eq }) =>
            and(eq(project.id, input.id), eq(project.userId, ctx.session.id)),
        })

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          })
        }

        await deleteProjectFolder(ctx.session.id, input.id).catch((error) => {
          console.error("Failed to delete R2 files:", error)
        })

        await ctx.db.delete(projectsTable).where(eq(projectsTable.id, input.id))

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to delete project",
        })
      }
    }),

  saveVersion: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        canvasState: z.record(z.string(), z.unknown()),
        editedImageUrl: z.string().optional(),
        filters: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rateLimitKey = `save-version:${ctx.session.email}`
      const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.PROJECT_SAVE)

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
        const project = await ctx.db.query.projectsTable.findFirst({
          where: (project, { and, eq }) =>
            and(
              eq(project.id, input.projectId),
              eq(project.userId, ctx.session.id),
            ),
        })

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          })
        }

        const versions = await ctx.db.query.projectVersionsTable.findMany({
          where: (version, { eq }) => eq(version.projectId, input.projectId),
        })

        const nextVersionNumber = versions.length + 1

        const [version] = await ctx.db
          .insert(projectVersionsTable)
          .values({
            projectId: input.projectId,
            versionNumber: nextVersionNumber,
            canvasState: input.canvasState,
            editedImageUrl: input.editedImageUrl,
            filters: input.filters,
          })
          .returning()

        await ctx.db
          .update(projectsTable)
          .set({ updatedAt: new Date() })
          .where(eq(projectsTable.id, input.projectId))

        return version
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to save version",
        })
      }
    }),
})
