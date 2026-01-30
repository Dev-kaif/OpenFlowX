"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { codeChannel } from "@/inngest/channels/code";

export type CodeToken = Realtime.Token<typeof codeChannel, ["status"]>;

export async function fetchCodeRealtimeToken(): Promise<CodeToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: codeChannel(),
        topics: ["status"]
    })
    return token
}
