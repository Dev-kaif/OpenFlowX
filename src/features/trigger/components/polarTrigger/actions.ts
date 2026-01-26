"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { polarTriggerChannel } from "@/inngest/channels/polarTrigger";

export type PolarTrigggerToken = Realtime.Token<typeof polarTriggerChannel, ["status"]>;

export async function fetchPolarTrigggerRealtimeToken(): Promise<PolarTrigggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: polarTriggerChannel(),
        topics: ["status"]
    })
    return token
}