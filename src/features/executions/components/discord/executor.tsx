import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars"
import { discordChannel } from "@/inngest/channels/discord";
import { decode } from 'html-entities';
import ky, { Options as kyOptions } from "ky"


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
})

type DiscordProps = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;
    username?: string;
}

export const DiscordExecutor: NodeExecutor<DiscordProps> = async ({
    data,
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        discordChannel().status({
            nodeId,
            status: "loading"
        }),
    );

    if (!data.content) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Discord Node: No Content configured");
    }

    try {
        const rawContent = Handlebars.compile(data.content)(context);

        // handelbars ouput: &quot;Name&quot; instead of "Name"
        // decode html does: &quot;Name&quot; --> "Name"
        const content = decode(rawContent)
        const username = data.username ? decode(Handlebars.compile(data.username)(context)) : undefined;

        const result = await step.run("Discord-webhooks", async () => {

            if (!data.variableName) {
                await publish(
                    discordChannel().status({
                        nodeId,
                        status: "error"
                    }),
                );
                throw new NonRetriableError("Discord Node : No Varible Name configured");
            }

            if (!data.webhookUrl) {
                await publish(
                    discordChannel().status({
                        nodeId,
                        status: "error"
                    }),
                );
                throw new NonRetriableError("Discord Node : No webhook url configured");
            }


            await ky.post(data.webhookUrl, {
                json: {
                    content: content.slice(0, 2000),
                    username
                }
            })

            return {
                ...context,
                [data.variableName]: {
                    discordMessageSent: true,
                    messageContent: content.slice(0, 2000),
                }
            }
        })

        await publish(
            discordChannel().status({
                nodeId,
                status: "success"
            }),
        );

        return result;

    } catch (error) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error"
            }),
        );
        throw error
    }
}