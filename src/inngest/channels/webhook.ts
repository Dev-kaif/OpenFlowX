import { channel, topic } from "@inngest/realtime";

export const WEBHOOK_TRIGGER_CHANNEL = "webhook-trigger-executioner"

export const webhookTriggerChannel = channel(WEBHOOK_TRIGGER_CHANNEL)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )