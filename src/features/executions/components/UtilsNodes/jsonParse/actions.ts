"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { jsonParseChannel } from "@/inngest/channels/jsonParse";

export type JsonParseToken = Realtime.Token<typeof jsonParseChannel, ["status"]>;

export async function fetchJsonParseRealtimeToken(): Promise<JsonParseToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: jsonParseChannel(),
        topics: ["status"]
    })
    return token
}
