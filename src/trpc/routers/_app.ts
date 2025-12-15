import { workflowsRouter } from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";


export const appRouter = createTRPCRouter({
  workflows:workflowsRouter,
});

export type AppRouter = typeof appRouter;
