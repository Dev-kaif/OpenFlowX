import { channel, topic } from "@inngest/realtime";

export const AGENT_CHANNEL_NAME = "agent-executioner"

export const agentChannel = channel(AGENT_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )