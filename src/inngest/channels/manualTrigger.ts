import { channel, topic } from "@inngest/realtime";

export const MANUAL_TRIGGER_CHANNEL = "manual-trigger-executioner"

export const manualTriggerChannel = channel(MANUAL_TRIGGER_CHANNEL)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )