"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { deepseekChannel } from "@/inngest/channels/deepseek";

export type DeepseekToken = Realtime.Token<typeof deepseekChannel, ["status"]>;

export async function fetchDeepseekRealtimeToken(): Promise<DeepseekToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: deepseekChannel(),
        topics: ["status"]
    })
    return token
}