import { Button } from "@/components/ui/button"
import { FlaskConicalIcon } from "lucide-react"

export const ExecuteWorkflowButton = ({ workflowId }: {
    workflowId: string
}) => {
    return (
        <Button size={"lg"} onClick={()=>{}} disabled={false}>
            <FlaskConicalIcon className="size-4" />
            Execute Workflow
        </Button>
    )
}