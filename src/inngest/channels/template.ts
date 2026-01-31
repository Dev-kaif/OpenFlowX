import { channel, topic } from "@inngest/realtime";

export const TEMPLATE_CHANNEL_NAME = "template-executioner"

export const templateChannel = channel(TEMPLATE_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )