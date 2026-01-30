import { workflowsRouter } from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";
import { credentialRouter } from "@/features/credentails/server/routers";
import { executionsRouter } from "@/features/executions/server/router";


export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialRouter,
  executions: executionsRouter
});

export type AppRouter = typeof appRouter;
