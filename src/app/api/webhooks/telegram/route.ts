export const runtime = "nodejs";

import ky from "ky";
import { verify } from "@/lib/sign";
import prisma from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.replace(/^"|"$/g, "");

const telegram = ky.create({
    prefixUrl: `https://api.telegram.org/bot${BOT_TOKEN}`,
    headers: { "Content-Type": "application/json" },
});

async function sendTelegramMessage(chatId: number, text: string) {
    await telegram.post("sendMessage", {
        json: {
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
        },
    });
}

export async function POST(req: Request) {
    const body = await req.json();
    const message = body?.message;

    if (!message) {
        return Response.json({ ok: true });
    }

    const text: string | undefined = message.text;
    const chat = message.chat;
    const from = message.from;

    if (from?.id) {
        prisma.telegramConnection.updateMany({
            where: { telegramUserId: String(from.id) },
            data: { lastMessageAt: new Date() },
        }).catch(() => { });
    }

    const response = Response.json({ ok: true });

    process.nextTick(async () => {
        if (!text || !text.startsWith("/start")) {
            return;
        }

        const [, token] = text.split(" ");
        if (!token) {
            await sendTelegramMessage(
                chat.id,
                "⚠️ Invalid connection link. Please reconnect from the app.",
            );
            return;
        }

        let payload: { userId: string };
        try {
            payload = verify(token);
        } catch {
            await sendTelegramMessage(
                chat.id,
                "⚠️ This connection link has expired. Please generate a new one.",
            );
            return;
        }

        await prisma.telegramConnection.upsert({
            where: {
                telegramUserId: String(from.id),
            },
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
            "✅ Telegram connected successfully!\nYou can now use Telegram nodes in your workflows.",
        );
    });

    return response;
}
