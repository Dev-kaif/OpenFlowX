"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { scraperChannel } from "@/inngest/channels/scraper";

export type ScraperToken = Realtime.Token<typeof scraperChannel, ["status"]>;

export async function fetchScraperRealtimeToken(): Promise<ScraperToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: scraperChannel(),
        topics: ["status"]
    })
    return token
}