import { channel, topic } from "@inngest/realtime";

export const SEARCH_CHANNEL_NAME = "search-executioner"

export const searchChannel = channel(SEARCH_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )