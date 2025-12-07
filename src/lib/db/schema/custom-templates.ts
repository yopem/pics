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

export const customTemplatesTable = pgTable(
  "custom_templates",
  {
    id: varchar("id", { length: 255 })
      .$defaultFn(() => createCustomId())
      .primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    platform: text("platform").notNull(),
    width: json("width").$type<number>().notNull(),
    height: json("height").$type<number>().notNull(),
    safeZone: json("safe_zone").$type<{
      top: number
      bottom: number
      left: number
      right: number
    }>(),
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
    userIdIdx: index("custom_templates_user_id_idx").on(table.userId),
  }),
)

export const insertCustomTemplateSchema = createInsertSchema(
  customTemplatesTable,
  {
    name: z.string().min(1).max(255),
    platform: z.string().min(1).max(100),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    safeZone: z
      .object({
        top: z.number().int().nonnegative(),
        bottom: z.number().int().nonnegative(),
        left: z.number().int().nonnegative(),
        right: z.number().int().nonnegative(),
      })
      .optional(),
  },
)

export const selectCustomTemplateSchema =
  createSelectSchema(customTemplatesTable)

export type CustomTemplate = z.infer<typeof selectCustomTemplateSchema>
export type InsertCustomTemplate = z.infer<typeof insertCustomTemplateSchema>
