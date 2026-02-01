"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { resendChannel } from "@/inngest/channels/resend";

export type ResendToken = Realtime.Token<typeof resendChannel, ["status"]>;

export async function fetchResendRealtimeToken(): Promise<ResendToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: resendChannel(),
        topics: ["status"]
    })
    return token
}