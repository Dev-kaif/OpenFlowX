"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { webhookTriggerChannel } from "@/inngest/channels/webhook";

export type WebhookToken = Realtime.Token<typeof webhookTriggerChannel, ["status"]>;

export async function fetchWebhookTriggerRealtimeToken(): Promise<WebhookToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: webhookTriggerChannel(),
        topics: ["status"]
    })
    return token
}