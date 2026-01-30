import { Realtime } from "@inngest/realtime";
import { GetStepTools, Inngest } from "inngest";

export type NodeOutput = Record<string, any>;

export type StepTools = GetStepTools<Inngest.Any>;

export interface NodeExecutionParams<TData = Record<string, unknown>> {
    nodeId: string;
    data: TData;
    context: Record<string, any>;
    userId: string;
    step: StepTools;
    publish: Realtime.PublishFn;
}

export type NodeExecutor<TData = Record<string, unknown>> = (
    params: NodeExecutionParams<TData>
) => Promise<NodeOutput>;
