import { channel, topic } from "@inngest/realtime";

export const SLACK_CHANNEL_NAME = "slack-executioner"

export const slackChannel = channel(SLACK_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )