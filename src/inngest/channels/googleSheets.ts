import { channel, topic } from "@inngest/realtime";

export const GOOGLE_SHEETS_CHANNEL_NAME = "googlesheets-executioner"

export const googleSheetsChannel = channel(GOOGLE_SHEETS_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )