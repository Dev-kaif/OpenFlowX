import { inngest } from "../client";

export default async function sendWorkflowExecution(data: {
    workflowId: string;
    [key: string]: any;
}) {
    return inngest.send({
        name: "workflows/execute.workflow",
        data
    })
}
