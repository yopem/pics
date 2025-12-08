import { eq } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/lib/api/trpc"
import { db } from "@/lib/db"
import {
  customTemplatesTable,
  insertCustomTemplateSchema,
} from "@/lib/db/schema/custom-templates"

export const customTemplatesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(customTemplatesTable)
      .where(eq(customTemplatesTable.userId, ctx.session.id))
      .orderBy(customTemplatesTable.createdAt)
  }),

  create: protectedProcedure
    .input(
      insertCustomTemplateSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [template] = await db
        .insert(customTemplatesTable)
        .values({
          ...input,
          userId: ctx.session.id,
        })
        .returning()

      return template
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await db
        .delete(customTemplatesTable)
        .where(eq(customTemplatesTable.id, input.id))
        .returning()

      if (deleted.userId !== ctx.session.id) {
        throw new Error("Template not found or unauthorized")
      }

      return { success: true }
    }),
})
