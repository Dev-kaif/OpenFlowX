import sendWorkflowExecution from "@/inngest/utils/sendWorkflowExecution";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const workflowId = url.searchParams.get("workflowId");

        if (!workflowId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required query parameter: workflowId",
                },
                { status: 400 }
            );
        }

        // Parse Polar payload
        const body = await request.json();

        const polarData = {
            eventType: body.type || body.event || "unknown",
            timestamp: body.created_at || new Date().toISOString(),
            raw: body.data || body,
        };

        await sendWorkflowExecution({
            workflowId,
            initialData: {
                polar: polarData,
            },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("Polar webhook error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to process Polar event",
            },
            { status: 500 }
        );
    }
}
