import { channel, topic } from "@inngest/realtime";

export const OPENROUTER_CHANNEL_NAME = "openRouter-executioner"

export const openRouterChannel = channel(OPENROUTER_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )