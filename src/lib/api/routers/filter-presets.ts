import { eq } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/lib/api/trpc"
import { db } from "@/lib/db"
import {
  filterPresetsTable,
  insertFilterPresetSchema,
} from "@/lib/db/schema/filter-presets"

export const filterPresetsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(filterPresetsTable)
      .where(eq(filterPresetsTable.userId, ctx.session.id))
      .orderBy(filterPresetsTable.createdAt)
  }),

  create: protectedProcedure
    .input(
      insertFilterPresetSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [preset] = await db
        .insert(filterPresetsTable)
        .values({
          ...input,
          userId: ctx.session.id,
        })
        .returning()

      return preset
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await db
        .delete(filterPresetsTable)
        .where(eq(filterPresetsTable.id, input.id))
        .returning()

      if (deleted.userId !== ctx.session.id) {
        throw new Error("Preset not found or unauthorized")
      }

      return { success: true }
    }),
})
