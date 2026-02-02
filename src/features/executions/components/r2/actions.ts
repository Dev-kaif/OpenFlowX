"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { r2Channel } from "@/inngest/channels/r2";

export type R2Token = Realtime.Token<typeof r2Channel, ["status"]>;

export async function fetchR2RealtimeToken(): Promise<R2Token> {
    const token = await getSubscriptionToken(inngest, {
        channel: r2Channel(),
        topics: ["status"]
    })
    return token
}