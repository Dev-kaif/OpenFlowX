import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../../types";
import { manualExecutionTrigger } from "@/features/trigger/components/manualTrigger/executor";
import { httpRequestTrigger } from "../httpRequest/executor";
import { googleFormTriggerExecution } from "@/features/trigger/components/googleFormTrigger/executor";

export const executorRegistory: Record<NodeType, NodeExecutor> = {
    [NodeType.INITIAL]: manualExecutionTrigger,
    [NodeType.MANUAL_TRIGGER]: manualExecutionTrigger,
    [NodeType.HTTP_REQUEST]: httpRequestTrigger,
    [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecution,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistory[type];
    if (!executor) {
        throw new Error("No executor found for node type")
    }
    return executor;
}