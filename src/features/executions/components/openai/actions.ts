"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { openAIChannel } from "@/inngest/channels/openAi";

export type OpenAIToken = Realtime.Token<typeof openAIChannel, ["status"]>;

export async function fetchOpenAIRealtimeToken(): Promise<OpenAIToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: openAIChannel(),
        topics: ["status"]
    })
    return token
}