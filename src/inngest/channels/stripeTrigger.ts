import { channel, topic } from "@inngest/realtime";

export const STRIPE_CHANNEL_NAME = "stripe-executioner"

export const stripeTriggerChannel = channel(STRIPE_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )