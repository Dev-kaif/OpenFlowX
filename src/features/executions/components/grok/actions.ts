"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { grokChannel } from "@/inngest/channels/grok";

export type XAIToken = Realtime.Token<typeof grokChannel, ["status"]>;

export async function fetchGrokRealtimeToken(): Promise<XAIToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: grokChannel(),
        topics: ["status"]
    })
    return token
}