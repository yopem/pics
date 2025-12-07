import { json, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { createCustomId } from "@/lib/utils/custom-id"

export const projectsTable = pgTable("projects", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createCustomId()),
  userId: text("user_id").notNull(),
  name: text().notNull(),
  status: text()
    .$type<"draft" | "published" | "archived">()
    .notNull()
    .default("draft"),
  thumbnail: text(),
  originalImageUrl: text("original_image_url"),
  metadata: json().$type<{ width: number; height: number; format: string }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const insertProjectSchema = createInsertSchema(projectsTable)
export const updateProjectSchema = createUpdateSchema(projectsTable)

export type SelectProject = typeof projectsTable.$inferSelect
export type InsertProject = typeof projectsTable.$inferInsert
