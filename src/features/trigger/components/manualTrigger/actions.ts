"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { manualTriggerChannel } from "@/inngest/channels/manualTrigger";

export type ManualTrigggerToken = Realtime.Token<typeof manualTriggerChannel, ["status"]>;

export async function fetchManualTrigggerRealtimeToken(): Promise<ManualTrigggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: manualTriggerChannel(),
        topics: ["status"]
    })
    return token
}