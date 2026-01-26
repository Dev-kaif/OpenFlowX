import type { NodeExecutor } from "@/features/executions/types";
import { polarTriggerChannel } from "@/inngest/channels/polarTrigger";

type PolarTrigger = Record<string, unknown>

export const polarTriggerExecution: NodeExecutor<PolarTrigger> = async ({
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        polarTriggerChannel().status({
            nodeId,
            status: "loading"
        }),
    );

    const result = await step.run("polar-trigger", async () => context);

    await publish(
        polarTriggerChannel().status({
            nodeId,
            status: "success"
        }),
    );

    return result;
}