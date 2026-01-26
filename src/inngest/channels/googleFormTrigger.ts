import { channel, topic } from "@inngest/realtime";

export const GOOGLE_FORM_CHANNEL_NAME = "google-form-executioner"

export const googleFormTriggerChannel = channel(GOOGLE_FORM_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error"
        }>(),
    )