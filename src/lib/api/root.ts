import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "@/lib/api/trpc"
import { customTemplatesRouter } from "./routers/custom-templates"
import { editorRouter } from "./routers/editor"
import { filterPresetsRouter } from "./routers/filter-presets"
import { postRouter } from "./routers/post"
import { projectsRouter } from "./routers/projects"

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => "ok"),

  post: postRouter,
  projects: projectsRouter,
  editor: editorRouter,
  customTemplates: customTemplatesRouter,
  filterPresets: filterPresetsRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
