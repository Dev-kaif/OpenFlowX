import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../../types";
import { manualExecutionTrigger } from "@/features/trigger/components/manualTrigger/executor";
import { httpRequestTrigger } from "../httpRequest/executor";

export const executorRegistory: Record<NodeType, NodeExecutor> = {
    [NodeType.INITIAL]: httpRequestTrigger,
    [NodeType.MANUAL_TRIGGER]: manualExecutionTrigger,
    [NodeType.HTTP_REQUEST]: httpRequestTrigger,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistory[type];
    if (!executor) {
        throw new Error("No executor found for node type")
    }
    return executor;
}