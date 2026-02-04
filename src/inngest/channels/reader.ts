import { channel, topic } from "@inngest/realtime";

export const DOCUMENT_READER_CHANNEL_NAME = "document-reader-executioner"

export const documentReaderChannel = channel(DOCUMENT_READER_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )