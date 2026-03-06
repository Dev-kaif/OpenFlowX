"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { agentChannel } from "@/inngest/channels/agent";

export type AgentToken = Realtime.Token<typeof agentChannel, ["status"]>;

export async function fetchAgentRealtimeToken(): Promise<AgentToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: agentChannel(),
        topics: ["status"]
    })
    return token
}
