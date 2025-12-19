import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowParams } from "./useWorkflowParams";

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowParams()

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
};

export const useSuspenseWorkflow = (id:string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.getOne.queryOptions({id}));
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

export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} removed`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.workflows.getOne.queryFilter({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Failed to remove workflow: ${error.message}`);
      },
    })
  );
};


export const useUpdateWorkflowName = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} updated`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id })
        )
      },
      onError: (error) => {
        toast.error(`Failed to update workflow: ${error.message}`);
      },
    })
  );
};

// export const useUpdateWorkflow = () => {
//   const trpc = useTRPC();
//   const queryClient = useQueryClient();

//   return useMutation(
//     trpc.workflows.update.mutationOptions({
//       onSuccess: (data) => {
//         toast.success(`Workflow ${data.name} saved`);
//         queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
//         queryClient.invalidateQueries(
//           trpc.workflows.getOne.queryOptions({ id: data.id })
//         )
//       },
//       onError: (error) => {
//         toast.error(`Failed to save workflow: ${error.message}`);
//       },
//     })
//   );
// };