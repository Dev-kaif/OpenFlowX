import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import prisma from "@/lib/db";
import { telegramChannel } from "@/inngest/channels/telegram";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonString);
});

type TelegramProps = {
    variableName?: string;
    message?: string;
};

export const TelegramExecutor: NodeExecutor<TelegramProps> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
    userId,
}) => {
    await publish(
        telegramChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    if (!data.variableName) {
        await publish(
            telegramChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError(
            "Telegram Node: No variable name configured",
        );
    }

    if (!data.message) {
        await publish(
            telegramChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError(
            "Telegram Node: No message configured",
        );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        throw new NonRetriableError(
            "Telegram Node: Bot token not configured on server",
        );
    }

    const { chatId } = await step.run(
        "get-telegram-connection",
        async () => {
            const connection = await prisma.telegramConnection.findFirst({
                where: {
                    userId,
                    isActive: true,
                },
                select: {
                    chatId: true,
                },
            });

            if (!connection?.chatId) {
                throw new NonRetriableError(
                    "Telegram Node: Telegram not connected. Please connect Telegram in Settings.",
                );
            }

            return { chatId: connection.chatId };
        },
    );

    const message = Handlebars.compile(data.message, {
        noEscape: true,
    })(context);

    try {
        const result = await step.run("telegram-send-message", async () => {
            const res = await fetch(
                `https://api.telegram.org/bot${botToken}/sendMessage`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: "HTML",
                    }),
                },
            );

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(
                    err?.description ||
                    `Telegram API Error (${res.status})`,
                );
            }

            const json = await res.json();

            return {
                messageId: json.result.message_id,
                chatId: json.result.chat.id,
                text: json.result.text,
            };
        });

        await publish(
            telegramChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return {
            [data.variableName]: result,
        };
    } catch (error: any) {
        await publish(
            telegramChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError(
            `Telegram Node Failed: ${error.message}`,
        );
    }
};
