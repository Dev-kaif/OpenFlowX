"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { postgressChannel } from "@/inngest/channels/postgress";
import { Client } from "pg";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";

export type PostgressToken = Realtime.Token<typeof postgressChannel, ["status"]>;

export async function fetchPostgressRealtimeToken(): Promise<PostgressToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: postgressChannel(),
        topics: ["status"]
    })
    return token
}


export async function fetchPostgressTables(connectionId: string, userId: string) {
    if (!connectionId) return { success: false, error: "Missing connection string" };

    const { value } = await prisma.credential.findUniqueOrThrow({
        where: {
            id: connectionId
        },
        select: {
            value: true
        }
    });

    const connectionString = decryptApiKey(value)

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();

        // Query to get all public tables
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        return { success: true, tables: res.rows.map((r) => r.table_name) as string[] };
    } catch (error: any) {
        return { success: false, error: error.message };
    } finally {
        await client.end().catch(() => { });
    }
}