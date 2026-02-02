import { channel, topic } from "@inngest/realtime";

export const TELEGRAM_TRIGGER_CHANNEL = "telegram-trigger-executioner"

export const telegramTriggerChannel = channel(TELEGRAM_TRIGGER_CHANNEL)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )