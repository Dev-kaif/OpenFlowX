import { Button } from "@/components/ui/button"
import { useExecuteWorkflow } from "@/features/workflows/hooks/useWorkflows"
import { FlaskConicalIcon } from "lucide-react"

export const ExecuteWorkflowButton = ({ workflowId }: {
    workflowId: string
}) => {
    const executeWorkflow = useExecuteWorkflow();

    const handleExecution = () => {
        executeWorkflow.mutate({
            id:workflowId
        })
    }

    return (
        <Button
            size={"lg"}
            onClick={handleExecution}
            disabled={executeWorkflow.isPending}
        >
            <FlaskConicalIcon className="size-4" />
            Execute Workflow
        </Button>
    )
}