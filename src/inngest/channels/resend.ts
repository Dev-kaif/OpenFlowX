import { channel, topic } from "@inngest/realtime";

export const RESEND_CHANNEL_NAME = "resend-executioner"

export const resendChannel = channel(RESEND_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )