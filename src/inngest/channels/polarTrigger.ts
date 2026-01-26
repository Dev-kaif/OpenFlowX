
import { channel, topic } from "@inngest/realtime";

export const POLAR_CHANNEL_NAME = "polar-executioner"

export const polarTriggerChannel = channel(POLAR_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )