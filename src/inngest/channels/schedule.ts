import { channel, topic } from "@inngest/realtime";

export const SCHEDULE_CHANNEL_NAME = "schedule-executioner"

export const scheduleChannel = channel(SCHEDULE_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )