"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { s3Channel } from "@/inngest/channels/s3";

export type S3Token = Realtime.Token<typeof s3Channel, ["status"]>;

export async function fetchS3RealtimeToken(): Promise<S3Token> {
    const token = await getSubscriptionToken(inngest, {
        channel: s3Channel(),
        topics: ["status"]
    })
    return token
}