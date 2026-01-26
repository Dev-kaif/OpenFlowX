import type { NodeExecutor } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stripeTrigger";

type StripeTrigger = Record<string, unknown>

export const stripeTriggerExecution: NodeExecutor<StripeTrigger> = async ({
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        stripeTriggerChannel().status({
            nodeId,
            status: "loading"
        }),
    );

    const result = await step.run("stripe-trigger", async () => context);

    await publish(
        stripeTriggerChannel().status({
            nodeId,
            status: "success"
        }),
    );

    return result;
}