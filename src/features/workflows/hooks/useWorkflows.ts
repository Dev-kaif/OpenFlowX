import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowParams } from "./useWorkflowParams";

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowParams()

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
};


export const useCreateWorkflow = () => {
  const trcp = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trcp.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" Created`);
        queryClient.invalidateQueries(trcp.workflows.getMany.queryOptions({}))
      },
      onError: (error) => {
        toast.error(`Failed to create Workflow : ${error.message}`)
      }
    })
  )
}