import { runScheduledWorkflow } from "@/features/trigger/components/schedule/function";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    executeWorkflow,
    runScheduledWorkflow
  ],
});
