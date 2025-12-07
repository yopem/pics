import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "@/lib/api/trpc"
import { editorRouter } from "./routers/editor"
import { postRouter } from "./routers/post"
import { projectsRouter } from "./routers/projects"

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => "ok"),

  post: postRouter,
  projects: projectsRouter,
  editor: editorRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
