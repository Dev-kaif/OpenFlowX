import { Realtime } from "@inngest/realtime";
import { GetStepTools, Inngest } from "inngest"

export type WorkflowContext = Record<string, unknown>

export type stepTools = GetStepTools<Inngest.Any>

export interface NodeExecutionParams<Tdata = Record<string, unknown>> {
    data: Tdata;
    nodeId: string;
    userId: string;
    context: WorkflowContext;
    step: stepTools;
    publish: Realtime.PublishFn;
}

export type NodeExecutor<Tdata = Record<string, unknown>> = (
    params: NodeExecutionParams<Tdata>
) => Promise<WorkflowContext>