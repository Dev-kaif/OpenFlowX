"use client"

import { ErrorView, LoadingView } from "@/components/entity/entityComponents";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/useWorkflows"

export const Editor = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);

    return (
        <div className="px-10 flex flex-1 whitespace-pre-wrap">
            {JSON.stringify(workflow, null, 2)}
        </div>
    )
};

export const EditorLoading = () => {
    return (
        <LoadingView
            message="Loding the workflow editor..."
        />
    )
}

export const EditorError = () => {
    return (
        <ErrorView
            message="Error while loading the workflow editor"
        />
    )
}