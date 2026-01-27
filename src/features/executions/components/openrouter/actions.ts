"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { openRouterChannel } from "@/inngest/channels/openrouter";

export type OpenRouterToken = Realtime.Token<typeof openRouterChannel, ["status"]>;

export async function fetchOpenRouterRealtimeToken(): Promise<OpenRouterToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: openRouterChannel(),
        topics: ["status"]
    })
    return token
}