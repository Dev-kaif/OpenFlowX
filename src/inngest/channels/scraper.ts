import { channel, topic } from "@inngest/realtime";

export const SCRAPER_CHANNEL_NAME = "scraper-executioner"

export const scraperChannel = channel(SCRAPER_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )