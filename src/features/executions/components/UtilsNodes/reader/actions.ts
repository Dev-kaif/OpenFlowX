"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { documentReaderChannel } from "@/inngest/channels/reader";

export type DocumentReaderToken = Realtime.Token<typeof documentReaderChannel, ["status"]>;

export async function fetchDocumentReaderRealtimeToken(): Promise<DocumentReaderToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: documentReaderChannel(),
        topics: ["status"]
    })
    return token
}