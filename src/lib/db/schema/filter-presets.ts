import {
  index,
  json,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

import { createCustomId } from "@/lib/utils/custom-id"

export const filterPresetsTable = pgTable(
  "filter_presets",
  {
    id: varchar("id", { length: 255 })
      .$defaultFn(() => createCustomId())
      .primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    filters: json("filters")
      .$type<
        {
          type: string
          value: number | Record<string, number>
        }[]
      >()
      .notNull(),
    thumbnail: text("thumbnail"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("filter_presets_user_id_idx").on(table.userId),
  }),
)

export const insertFilterPresetSchema = createInsertSchema(filterPresetsTable, {
  name: z.string().min(1).max(255),
  filters: z.array(
    z.object({
      type: z.string(),
      value: z.union([z.number(), z.record(z.string(), z.number())]),
    }),
  ),
})

export const selectFilterPresetSchema = createSelectSchema(filterPresetsTable)

export type FilterPreset = z.infer<typeof selectFilterPresetSchema>
export type InsertFilterPreset = z.infer<typeof insertFilterPresetSchema>
