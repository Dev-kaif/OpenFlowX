"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { delayChannel } from "@/inngest/channels/delay";

export type DelayToken = Realtime.Token<typeof delayChannel, ["status"]>;

export async function fetchDelayRealtimeToken(): Promise<DelayToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: delayChannel(),
        topics: ["status"]
    })
    return token
}
