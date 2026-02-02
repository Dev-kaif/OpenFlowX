import { workflowsRouter } from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";
import { credentialRouter } from "@/features/credentails/server/routers";
import { executionsRouter } from "@/features/executions/server/router";
import { SchedulerRouter } from "@/features/trigger/components/schedule/router";
import { settingsRouter } from "@/features/settings/server/router";


export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialRouter,
  executions: executionsRouter,
  scheduler: SchedulerRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
