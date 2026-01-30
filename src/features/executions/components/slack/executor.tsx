import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import ky from "ky";
import { slackChannel } from "@/inngest/channels/slack";
import { markdownToSlack } from "./helper";


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonString);
});


type SlackProps = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;
    username?: string;
};


export const SlackExecutor: NodeExecutor<SlackProps> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        slackChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    if (!data.variableName) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Slack Node: No variable name configured");
    }

    if (!data.webhookUrl) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Slack Node: No webhook URL configured");
    }

    if (!data.content) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Slack Node: No message content configured");
    }

    try {

        const rawContent = Handlebars.compile(data.content)(context);
        const decoded = decode(rawContent);
        const text = markdownToSlack(decoded).slice(0, 40000);

        const username = data.username
            ? decode(Handlebars.compile(data.username)(context))
            : undefined;


        const result = await step.run("slack-webhook", async () => {
            await ky.post(data.webhookUrl!, {
                json: {
                    text,
                    ...(username ? { username } : {}),
                },
            });

            return {
                ...context,
                [data.variableName!]: {
                    slackMessageSent: true,
                    messageText: text,
                },
            };
        });

        await publish(
            slackChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return result;
    } catch (error) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw error;
    }
};
