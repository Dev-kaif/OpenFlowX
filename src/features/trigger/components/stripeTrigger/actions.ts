"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { stripeTriggerChannel } from "@/inngest/channels/stripeTrigger";

export type StripeTrigggerToken = Realtime.Token<typeof stripeTriggerChannel, ["status"]>;

export async function fetchStripeTrigggerRealtimeToken(): Promise<StripeTrigggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: stripeTriggerChannel(),
        topics: ["status"]
    })
    return token
}