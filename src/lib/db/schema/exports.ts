import { json, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { createCustomId } from "@/lib/utils/custom-id"
import { projectVersionsTable } from "./project-versions"
import { projectsTable } from "./projects"

export const exportsTable = pgTable("exports", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createCustomId()),
  projectId: text("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  versionId: text("version_id").references(() => projectVersionsTable.id, {
    onDelete: "set null",
  }),
  exportType: text("export_type")
    .$type<"social-media" | "favicon" | "download">()
    .notNull(),
  format: text().notNull(),
  dimensions: json().$type<{ width: number; height: number }>(),
  url: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const insertExportSchema = createInsertSchema(exportsTable)
export const updateExportSchema = createUpdateSchema(exportsTable)

export type SelectExport = typeof exportsTable.$inferSelect
export type InsertExport = typeof exportsTable.$inferInsert
