"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { telegramTriggerChannel } from "@/inngest/channels/telegramTrigger";

export type TelegramTrigggerToken = Realtime.Token<typeof telegramTriggerChannel, ["status"]>;

export async function fetchTelegramTrigggerRealtimeToken(): Promise<TelegramTrigggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: telegramTriggerChannel(),
        topics: ["status"]
    })
    return token
}