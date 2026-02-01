"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { searchChannel } from "@/inngest/channels/search";

export type SearchToken = Realtime.Token<typeof searchChannel, ["status"]>;

export async function fetchSearchRealtimeToken(): Promise<SearchToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: searchChannel(),
        topics: ["status"]
    })
    return token
}