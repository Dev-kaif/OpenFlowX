"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { templateChannel } from "@/inngest/channels/template";

export type TemplateToken = Realtime.Token<typeof templateChannel, ["status"]>;

export async function fetchTemplateRealtimeToken(): Promise<TemplateToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: templateChannel(),
        topics: ["status"]
    })
    return token
}