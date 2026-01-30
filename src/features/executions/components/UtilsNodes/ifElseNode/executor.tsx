import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { ifElseChannel } from "@/inngest/channels/ifElse";

type IfNodeConfig = {
    variableName?: string;
    condition?: string;
};

export const IfNodeExecutor: NodeExecutor<IfNodeConfig> = async ({
    data,
    context,
    nodeId,
    step,
    publish,
}) => {
    await publish(
        ifElseChannel().status({
            nodeId,
            status: "loading",
        })
    );

    const variableName = data.variableName || "condition";

    if (!data.condition) {
        await publish(
            ifElseChannel().status({ nodeId, status: "error" })
        );
        throw new NonRetriableError("IF Node: 'condition' field is required");
    }

    try {
        const result = await step.run("if-evaluate-condition", async () => {
            const template = Handlebars.compile(data.condition!, { noEscape: true });

            const resolved = template(context);

            let value: unknown;
            try {
                value = Function(`"use strict"; return (${resolved});`)();
            } catch (err: any) {
                throw new NonRetriableError(
                    `IF Node Syntax Error: Failed to evaluate expression "${resolved}". Error: ${err.message}`
                );
            }

            if (typeof value === "string") {
                if (value.toLowerCase() === "true") return true;
                if (value.toLowerCase() === "false") return false;
            }

            if (typeof value !== "boolean") {
                throw new NonRetriableError(
                    `IF Node Error: Condition must return a boolean (true/false). Got: ${typeof value} (${value})`
                );
            }

            return value;
        });

        await publish(
            ifElseChannel().status({
                nodeId,
                status: "success",
            })
        );

        return {
            [variableName]: {
                result,
            },
        };

    } catch (error: any) {
        await publish(
            ifElseChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw error;
    }
};