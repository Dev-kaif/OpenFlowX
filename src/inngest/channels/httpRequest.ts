import { channel, topic } from "@inngest/realtime";

export const HTTP_CHANNEL_NAME = "http-request-executioner"

export const httpRequestChannel = channel(HTTP_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )