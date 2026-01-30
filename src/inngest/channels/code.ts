import { channel, topic } from "@inngest/realtime";

export const CODE_CHANNEL_NAME = "code-executioner"

export const codeChannel = channel(CODE_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )