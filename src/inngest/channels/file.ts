import { channel, topic } from "@inngest/realtime";

export const FILE_CHANNEL_NAME = "file-executioner"

export const fileChannel = channel(FILE_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )