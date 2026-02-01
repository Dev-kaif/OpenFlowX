import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";
import { resendChannel } from "@/inngest/channels/resend";



type ResendNodeData = {
    credentialId?: string;
    to?: string;
    subject?: string;
    html?: string;
    from?: string;
    variableName?: string;
};




export const ResendExecutor: NodeExecutor<ResendNodeData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
    userId,
}) => {
    await publish(
        resendChannel().status({
            nodeId,
            status: "loading",
        })
    );

    if (!data.credentialId) {
        await publish(
            resendChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Resend Node: Credential is required");
    }


    if (!data.to) {
        await publish(
            resendChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Resend Node: Recipient (to) is required");
    }

    if (!data.subject || data.subject.trim().length === 0) {
        await publish(
            resendChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Resend Node: Subject is required");
    }

    if (!data.html || data.html.trim().length === 0) {
        await publish(
            resendChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Resend Node: HTML body is required");
    }

    if (!data.variableName) {
        await publish(
            resendChannel().status({
                nodeId,
                status: "loading",
            })
        );

        throw new NonRetriableError("Resend Node: Variable name is required");
    }

    try {

        const credential = await prisma.credential.findFirst({
            where: {
                id: data.credentialId,
                userId,
            },
        });

        if (!credential) {
            await publish(
                resendChannel().status({
                    nodeId,
                    status: "error",
                })
            );
            throw new NonRetriableError("Resend Node: Credential not found");
        }

        const apiKey = decryptApiKey(credential.value);

        const to = Handlebars.compile(data.to)(context);
        const subject = Handlebars.compile(data.subject)(context);
        const html = Handlebars.compile(data.html, {
            noEscape: true
        })(context)

        const from = data.from
            ? Handlebars.compile(data.from)(context)
            : "onboarding@resend.dev";


        const result = await step.run("resend-send-email", async () => {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    from,
                    to: [to],
                    subject,
                    html,
                }),
            });

            if (!response.ok) {
                let message = `Resend Error (${response.status})`;

                try {
                    const err = await response.json();
                    message = err?.message ?? message;
                } catch {
                }

                throw new Error(message);
            }

            const json = await response.json();

            return {
                id: json.id,
                provider: "resend",
                to,
                subject,
                sentAt: new Date().toISOString(),
            };
        });

        await publish(
            resendChannel().status({
                nodeId,
                status: "success",
            })
        );

        return {
            [data.variableName]: result,
        };

    } catch (error: any) {
        await publish(
            resendChannel().status({
                nodeId,
                status: "error",
            })
        );

        throw new NonRetriableError(
            `Resend Node Failed: ${error.message}`
        );
    }
};
