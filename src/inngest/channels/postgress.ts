import { channel, topic } from "@inngest/realtime";

export const POSTGRESS_CHANNEL_NAME = "postgress-executioner"

export const postgressChannel = channel(POSTGRESS_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )