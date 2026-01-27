import { workflowsRouter } from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";
import { credentialRouter } from "@/features/credentails/server/routers";


export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialRouter,
});

export type AppRouter = typeof appRouter;
