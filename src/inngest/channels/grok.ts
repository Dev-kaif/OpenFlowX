import { channel, topic } from "@inngest/realtime";

export const GROK_CHANNEL_NAME = "grok-executioner"

export const grokChannel = channel(GROK_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )