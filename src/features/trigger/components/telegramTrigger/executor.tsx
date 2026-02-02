import type { NodeExecutor } from "@/features/executions/types";
import { telegramTriggerChannel } from "@/inngest/channels/telegramTrigger";

type TelegramTriggerPayload = Record<string, unknown>;

export const telegramExecutionTrigger: NodeExecutor<TelegramTriggerPayload> = async ({
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        telegramTriggerChannel().status({
            nodeId,
            status: "loading",
        })
    );

    const result = await step.run("telegram-trigger", async () => {
        return context;
    });

    await publish(
        telegramTriggerChannel().status({
            nodeId,
            status: "success",
        })
    );

    return result;
};
