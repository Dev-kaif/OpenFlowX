"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { telegramChannel } from "@/inngest/channels/telegram";

export type TelegramToken = Realtime.Token<typeof telegramChannel, ["status"]>;

export async function fetchTelegramRealtimeToken(): Promise<TelegramToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: telegramChannel(),
        topics: ["status"]
    })
    return token
}