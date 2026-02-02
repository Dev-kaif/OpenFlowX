import { channel, topic } from "@inngest/realtime";

export const S3_CHANNEL_NAME = "s3-executioner"

export const s3Channel = channel(S3_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )