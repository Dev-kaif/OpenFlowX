import type { NodeExecutor } from "@/features/executions/types";

type ManualTrigger = Record<string, unknown>

export const manualExecutionTrigger: NodeExecutor<ManualTrigger> = async ({
    nodeId,
    context,
    step
}) => {

    const result = await step.run("manual-trigger", async () => context)
    return result;
}