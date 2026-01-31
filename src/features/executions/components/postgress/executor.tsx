import { NodeExecutor } from "@/features/executions/types";
import { Client } from "pg";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { postgressChannel } from "@/inngest/channels/postgress";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";

type PostgresNodeData = {
    variableName?: string;
    credentialId?: string;
    action?: "INSERT" | "SELECT" | "UPDATE" | "DELETE" | "QUERY";
    tableName?: string;
    data?: string;   // JSON string for Insert/Update
    filter?: string; // JSON string for Select/Delete filters
    rawQuery?: string; // SQL string for Raw Query mode
};


const parseJSON = (str: string | undefined, context: any) => {
    if (!str) return {};
    try {
        const resolved = Handlebars.compile(str)(context);
        return JSON.parse(resolved);
    } catch (e) {
        throw new Error(`Invalid JSON format: ${str}`);
    }
};

export const PostgresExecutor: NodeExecutor<PostgresNodeData> = async ({
    data,
    nodeId,
    context,
    step,
    userId,
    publish,
}) => {

    await publish(
        postgressChannel().status({
            nodeId,
            status: "loading"
        })
    );

    if (!data.credentialId) {
        await publish(
            postgressChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("Postgres Node: Connection string is required");
    }

    if (!data.variableName) {
        await publish(
            postgressChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Postgres Node: No variable name configured");
    }


    try {

        const cred = await prisma.credential.findUniqueOrThrow({
            where: {
                id: data.credentialId,
                userId
            },
        });

        const connectionString = decryptApiKey(cred.value);

        const result = await step.run("run-db-operation", async () => {

            const client = new Client({
                connectionString: connectionString,
                ssl: { rejectUnauthorized: false },
            });

            await client.connect();

            try {
                let queryText = "";
                let queryValues: any[] = [];

                // INSERT
                if (data.action === "INSERT") {
                    const payload = parseJSON(data.data, context);
                    const columns = Object.keys(payload);
                    const values = Object.values(payload);

                    if (columns.length === 0) throw new Error("No data provided for INSERT");

                    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
                    queryText = `INSERT INTO "${data.tableName}" (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *;`;
                    queryValues = values;
                }

                // SELECT
                else if (data.action === "SELECT") {
                    const filters = parseJSON(data.filter, context);
                    const keys = Object.keys(filters);
                    const values = Object.values(filters);

                    if (keys.length > 0) {
                        const whereClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(" AND ");
                        queryText = `SELECT * FROM "${data.tableName}" WHERE ${whereClause} LIMIT 100;`;
                        queryValues = values;
                    } else {
                        queryText = `SELECT * FROM "${data.tableName}" LIMIT 100;`;
                    }
                }

                // UPDATE
                else if (data.action === "UPDATE") {
                    const payload = parseJSON(data.data, context);
                    const filters = parseJSON(data.filter, context);

                    const updateKeys = Object.keys(payload);
                    const filterKeys = Object.keys(filters);
                    const allValues = [...Object.values(payload), ...Object.values(filters)];

                    if (updateKeys.length === 0) throw new Error("No data provided for UPDATE");

                    const setClause = updateKeys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
                    const whereClause = filterKeys.map((k, i) => `"${k}" = $${i + 1 + updateKeys.length}`).join(" AND ");

                    queryText = `UPDATE "${data.tableName}" SET ${setClause} WHERE ${whereClause} RETURNING *;`;
                    queryValues = allValues;
                }

                // RAW QUERY
                else if (data.action === "QUERY") {
                    if (!data.rawQuery) throw new Error("Raw Query is empty");
                    queryText = data.rawQuery;
                }

                // Execute
                const res = await client.query(queryText, queryValues);
                return res.rows;

            } finally {
                await client.end();
            }
        });

        await publish(
            postgressChannel().status({
                nodeId,
                status: "success"
            })
        );

        const rows = Array.isArray(result) ? result : [];

        return {
            [data.variableName!]: {
                rows,
                count: rows.length,
                raw: result,
            },
        };

    } catch (error: any) {
        await publish(
            postgressChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError(`DB Error: ${error.message}`);
    }
};