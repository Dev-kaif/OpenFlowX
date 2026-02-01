import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { google } from "googleapis";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";
import { googleSheetsChannel } from "@/inngest/channels/googleSheets";

type GoogleSheetsNodeData = {
    credentialId?: string;
    action?: "append" | "read";
    spreadsheetId?: string;
    range?: string;
    values?: string;
    variableName?: string;
};

export const GoogleSheetsExecutor: NodeExecutor<
    GoogleSheetsNodeData
> = async ({ data, nodeId, context, step, publish, userId }) => {
    await publish(
        googleSheetsChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    if (!data.credentialId) {
        await publish(
            googleSheetsChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Sheets Node: Credential is required");
    }

    if (!data.spreadsheetId) {
        await publish(
            googleSheetsChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Sheets Node: Spreadsheet ID is required");
    }

    try {
        const cred = await prisma.credential.findFirst({
            where: {
                id: data.credentialId,
                userId,
            },
        });

        if (!cred) {
            await publish(
                googleSheetsChannel().status({
                    nodeId,
                    status: "error",
                }),
            );
            throw new NonRetriableError("Sheets Node: Credential not found");
        }

        const credentials = JSON.parse(decryptApiKey(cred.value));

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({
            version: "v4",
            auth,
        });

        const spreadsheetId = Handlebars.compile(data.spreadsheetId)(context);
        const range = Handlebars.compile(data.range)(context);

        if (!data.variableName) {
            await publish(
                googleSheetsChannel().status({
                    nodeId,
                    status: "error",
                }),
            );
            throw new NonRetriableError("Sheets Node : No Variable Name configured");
        }


        const result = await step.run(`google-sheets-action:${nodeId}`, async () => {

            if (data.action === "read") {
                const res = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range,
                });

                const rows = res.data.values || [];

                if (rows.length === 0) {
                    return {
                        rows: [],
                        records: [],
                        count: 0,
                    };
                }

                const [headers, ...dataRows] = rows;

                const records = dataRows.map((row) =>
                    Object.fromEntries(
                        headers.map((header, index) => [
                            header,
                            row[index] ?? null,
                        ])
                    )
                );

                return {
                    rows,
                    records,
                    count: records.length,
                };
            }

            if (data.action === "append") {
                if (!data.values) {
                    throw new Error("Values are required for append action");
                }

                const compiledValues = Handlebars.compile(data.values, {
                    noEscape: true
                })(context);

                let rowData: any[];

                try {
                    rowData = JSON.parse(compiledValues);
                    if (!Array.isArray(rowData)) {
                        throw new Error("Values is not an array");
                    }
                } catch {
                    rowData = compiledValues.split(",").map((v) => v.trim());
                }

                const res = await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range,
                    valueInputOption: "USER_ENTERED",
                    requestBody: {
                        values: [rowData],
                    },
                });

                return {
                    updatedRange: res.data.updates?.updatedRange,
                    updatedRows: res.data.updates?.updatedRows,
                    success: true,
                };
            }

            throw new Error(`Unknown action: ${data.action}`);
        });

        await publish(
            googleSheetsChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return {
            [data.variableName]: result,
        };

    } catch (error: any) {
        await publish(
            googleSheetsChannel().status({
                nodeId,
                status: "error",
            }),
        );

        throw new NonRetriableError(
            `Google Sheets Error: ${error.message}`,
        );
    }
};
