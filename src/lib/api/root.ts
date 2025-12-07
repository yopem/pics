import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "@/lib/api/trpc"
import { postRouter } from "./routers/post"

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => "ok"),

  post: postRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
