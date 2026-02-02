"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { fileChannel } from "@/inngest/channels/file";

export type FileToken = Realtime.Token<typeof fileChannel, ["status"]>;

export async function fetchFileRealtimeToken(): Promise<FileToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: fileChannel(),
        topics: ["status"]
    })
    return token
}
