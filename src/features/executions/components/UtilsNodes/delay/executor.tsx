import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { delayChannel } from "@/inngest/channels/delay";

type DelayNodeData = {
    mode?: "duration" | "until";
    seconds?: number;
    until?: string; // handlebars → ISO date
};


export const DelayExecutor: NodeExecutor<DelayNodeData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        delayChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    if (!data.mode) {
        await publish(
            delayChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Delay Node: mode is required");
    }

    try {
        if (data.mode === "duration") {
            if (!data.seconds || data.seconds <= 0) {
                throw new NonRetriableError(
                    "Delay Node: seconds must be greater than 0"
                );
            }

            await step.sleep("delay-duration", `${data.seconds}s`);
        }

        if (data.mode === "until") {
            if (!data.until) {
                throw new NonRetriableError("Delay Node: until is required");
            }

            const resolved = Handlebars.compile(data.until)(context);
            const target = new Date(resolved);

            if (isNaN(target.getTime())) {
                throw new NonRetriableError("Delay Node: invalid date");
            }

            const ms = target.getTime() - Date.now();
            if (ms > 0) {
                await step.sleep("delay-until", ms);
            }
        }

        await publish(
            delayChannel().status({
                nodeId,
                status: "success",
            }),
        );

        // Delay does not change context
        return {};
    } catch (error) {
        await publish(
            delayChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw error;
    }
};
