export const runtime = "nodejs";

import ky from "ky";
import prisma from "@/lib/db";
import { verify } from "@/lib/sign";
import sendWorkflowExecution from "@/inngest/utils/sendWorkflowExecution";
import { NodeType } from "@/generated/prisma/enums";


const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.replace(/^"|"$/g, "");

if (!BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing");
}

const telegram = ky.create({
    prefixUrl: `https://api.telegram.org/bot${BOT_TOKEN}`,
    timeout: 30_000,
    retry: { limit: 2 },
    headers: {
        "Content-Type": "application/json",
    },
});

async function sendTelegramMessage(chatId: number, text: string) {
    try {
        await telegram.post("sendMessage", {
            json: {
                chat_id: chatId,
                text,
                parse_mode: "Markdown",
            },
        });
    } catch (error) {
        console.error("Telegram send failed:", error);
    }
}


export async function POST(req: Request) {
    let body: any;

    try {
        body = await req.json();
    } catch {
        return Response.json({ ok: true });
    }

    const message = body?.message;

    // Telegram may send non-message updates
    if (!message) {
        return Response.json({ ok: true });
    }

    // Respond immediately to Telegram
    const response = Response.json({ ok: true });

    // Handle logic safely inside lifecycle
    await handleTelegramMessage(body, message);

    return response;
}

async function handleTelegramMessage(body: any, message: any) {
    const text: string | undefined = message.text;
    const chat = message.chat;
    const from = message.from;

    if (!from?.id || !chat?.id) return;

    prisma.telegramConnection
        .updateMany({
            where: { telegramUserId: String(from.id) },
            data: { lastMessageAt: new Date() },
        })
        .catch(() => { });

    //CONNECT FLOW

    if (text?.startsWith("/start")) {
        const [, token] = text.split(" ");

        if (!token) {
            await sendTelegramMessage(
                chat.id,
                "⚠️ Invalid connection link. Please reconnect from the app."
            );
            return;
        }

        let payload: { userId: string };

        try {
            payload = verify(token);
        } catch {
            await sendTelegramMessage(
                chat.id,
                "⚠️ This connection link has expired. Please generate a new one."
            );
            return;
        }

        await prisma.telegramConnection.upsert({
            where: { telegramUserId: String(from.id) },
            update: {
                isActive: true,
                chatId: String(chat.id),
                username: from.username,
                firstName: from.first_name,
                lastName: from.last_name,
                lastMessageAt: new Date(),
            },
            create: {
                userId: payload.userId,
                telegramUserId: String(from.id),
                chatId: String(chat.id),
                username: from.username,
                firstName: from.first_name,
                lastName: from.last_name,
                isActive: true,
                lastMessageAt: new Date(),
            },
        });

        await sendTelegramMessage(
            chat.id,
            "✅ Telegram connected successfully!\nYou can now use Telegram triggers in your workflows."
        );

        return;
    }


    // WORKFLOW TRIGGER FLOW
    const command =
        typeof text === "string" && text.startsWith("/")
            ? text.split(" ")[0]
            : "";
    const fullText = typeof text === "string" ? text : "";

    const commandText =
        command && fullText.startsWith(command)
            ? fullText.slice(command.length).trim()
            : fullText;


    const connection = await prisma.telegramConnection.findFirst({
        where: {
            telegramUserId: String(from.id),
            isActive: true,
        },
    });

    if (!connection) return;

    const telegramTriggers = await prisma.node.findMany({
        where: {
            type: NodeType.TELEGRAM_TRIGGER,
            workflow: {
                userId: connection.userId,
            },
            OR: [
                {
                    data: {
                        path: ["command"],
                        equals: command,
                    },
                },
                {
                    data: {
                        path: ["command"],
                        equals: "",
                    },
                },
            ],
        },
        select: {
            workflowId: true,
        },
    });

    if (!telegramTriggers.length) return;

    for (const trigger of telegramTriggers) {
        await sendWorkflowExecution({
            workflowId: trigger.workflowId,
            initialData: {
                telegram: {
                    text: commandText,
                    from,
                    chat,
                    date: message.date,
                    raw: body,
                },
            },
        });
    }

    await sendTelegramMessage(chat.id, "✅ Workflow started successfully");
}
