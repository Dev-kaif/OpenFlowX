"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { googleFormTriggerChannel } from "@/inngest/channels/googleFormTrigger";

export type googleFormTrigggerToken = Realtime.Token<typeof googleFormTriggerChannel, ["status"]>;

export async function fetchGoogleFormTrigggerRealtimeToken(): Promise<googleFormTrigggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: googleFormTriggerChannel(),
        topics: ["status"]
    })
    return token
}