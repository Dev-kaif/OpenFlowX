import { channel, topic } from "@inngest/realtime";

export const OPENAI_CHANNEL_NAME = "openAi-executioner"

export const openAIChannel = channel(OPENAI_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )