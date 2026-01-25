import type { NodeExecutor } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channels/manualTrigger";

type ManualTrigger = Record<string, unknown>

export const manualExecutionTrigger: NodeExecutor<ManualTrigger> = async ({
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        manualTriggerChannel().status({
            nodeId,
            status: "loading"
        }),
    );

    const result = await step.run("manual-trigger", async () => context);

    await publish(
        manualTriggerChannel().status({
            nodeId,
            status: "success"
        }),
    );

    return result;
}