import { channel, topic } from "@inngest/realtime";

export const DELAY_CHANNEL_NAME = "delay-executioner"

export const delayChannel = channel(DELAY_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )