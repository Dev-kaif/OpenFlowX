import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { templateChannel } from "@/inngest/channels/template";

type TemplateNodeData = {
    template?: string;
    variableName?: string;
};

export const TemplateExecutor: NodeExecutor<TemplateNodeData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        templateChannel().status({
            nodeId,
            status: "loading"
        })
    );

    if (!data.template || !data.variableName) {
        await publish(
            templateChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("Template Node: template & variableName required");
    }

    try {
        const rendered = await step.run("render-template", async () => {
            const tpl = Handlebars.compile(data.template, {
                noEscape: true,
            })(context)?.trim?.();

            return tpl;
        });

        await publish(
            templateChannel().status({
                nodeId,
                status: "success"
            })
        );

        return {
            [data.variableName]: {
                text: rendered,
                raw: rendered,
            },
        };

    } catch (err: any) {
        await publish(
            templateChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError(`Template Error: ${err.message}`);
    }
};
