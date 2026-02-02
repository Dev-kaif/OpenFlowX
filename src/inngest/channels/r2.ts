import { channel, topic } from "@inngest/realtime";

export const R2_CHANNEL_NAME = "r2-executioner"

export const r2Channel = channel(R2_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )