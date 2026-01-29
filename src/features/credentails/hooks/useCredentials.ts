import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialParams } from "./useCredentailParams";
import { CredentialType } from "@/generated/prisma/enums";

export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialParams()

  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};


export const useCreateCredential = () => {
  const trcp = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trcp.credentials.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credntial "${data.name}" Created`);
        queryClient.invalidateQueries(trcp.credentials.getMany.queryOptions({}))
      },
      onError: (error) => {
        toast.error(`Failed to create Credentail : ${error.message}`)
      }
    })
  )
}

export const useRemoveCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credentails  ${data.name} removed`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.credentials.getOne.queryFilter({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Failed to remove Credentail : ${error.message}`);
      },
    })
  );
};

export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credentail ${data.name} saved`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.credentials.getOne.queryOptions({ id: data.id })
        )
      },
      onError: (error) => {
        toast.error(`Failed to save Credentail: ${error.message}`);
      },
    })
  );
};


export const useCredentialsByType = (type: CredentialType) => {
  const trpc = useTRPC();
  return useQuery(trpc.credentials.getByType.queryOptions({ type }));
};