import { integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { createCustomId } from "@/lib/utils/custom-id"
import { projectsTable } from "./projects"

export const projectVersionsTable = pgTable("project_versions", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createCustomId()),
  projectId: text("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  canvasState: json("canvas_state").$type<Record<string, unknown>>(),
  editedImageUrl: text("edited_image_url"),
  filters: json().$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const insertProjectVersionSchema =
  createInsertSchema(projectVersionsTable)
export const updateProjectVersionSchema =
  createUpdateSchema(projectVersionsTable)

export type SelectProjectVersion = typeof projectVersionsTable.$inferSelect
export type InsertProjectVersion = typeof projectVersionsTable.$inferInsert
