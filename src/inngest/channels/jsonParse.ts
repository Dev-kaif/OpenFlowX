import { channel, topic } from "@inngest/realtime";

export const JSON_PARSE_CHANNEL_NAME = "jsonParse-executioner"

export const jsonParseChannel = channel(JSON_PARSE_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )   