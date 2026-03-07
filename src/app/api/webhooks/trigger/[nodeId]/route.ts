import sendWorkflowExecution from "@/inngest/utils/sendWorkflowExecution";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);

        const workflowId = url.searchParams.get("workflowId");
        const nodeId = url.pathname.split("/").pop();

        if (!workflowId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required query parameter: workflowId",
                },
                { status: 400 }
            );
        }

        // Parse body safely
        let body: unknown = null;
        try {
            body = await request.json();
        } catch {
            body = await request.text();
        }

        const webhookData = {
            nodeId,
            body,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            query: Object.fromEntries(url.searchParams.entries()),
            timestamp: Date.now(),
        };

        await sendWorkflowExecution({
            workflowId,
            initialData: {
                webhook: webhookData,
            },
        });

        return NextResponse.json({
            success: true,
        });

    } catch (error) {
        console.error("Webhook trigger error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to process webhook",
            },
            { status: 500 }
        );
    }
}