import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { codeChannel } from "@/inngest/channels/code";

type CodeNodeData = {
    code?: string;
};

export const CodeExecutor: NodeExecutor<CodeNodeData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        codeChannel().status({
            nodeId,
            status: "loading",
        })
    );

    if (!data.code) {
        await publish(codeChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Code Node: 'code' field is required");
    }

    try {
        // Execution (Wrapped in step.run for Inngest tracing)
        const result = await step.run("run-custom-code", async () => {
            try {
                // "use strict" prevents the code from accidentally accessing global variables
                const userFunction = new Function("context", `"use strict"; ${data.code}`);

                // Run the function and capture the return value
                return userFunction(context);
            } catch (err: any) {
                // Capture syntax or runtime errors from the user's code
                throw new Error(`Runtime Error: ${err.message}`);
            }
        });

        await publish(
            codeChannel().status({
                nodeId,
                status: "success",
            })
        );

        return {
            code: {
                result,
            },
        };

    } catch (error: any) {
        await publish(
            codeChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError(error.message || "Unknown Code Execution Error");
    }
};