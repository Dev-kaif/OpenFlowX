import { channel, topic } from "@inngest/realtime";

export const IFELSE_CHANNEL_NAME = "ifelse-executioner"

export const ifElseChannel = channel(IFELSE_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )