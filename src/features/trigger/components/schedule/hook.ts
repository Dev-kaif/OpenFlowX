import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";


export const useCreateSchedule = () => {
    const trpc = useTRPC();

    return useMutation(
        trpc.scheduler.create.mutationOptions({
            onSuccess: () => {
                toast.success("Schedule created");
            },
            onError: (error) => {
                toast.error(
                    error.message ?? "Failed to create schedule"
                );
            },
        })
    );
};


export const useUpdateSchedule = () => {
    const trpc = useTRPC();

    return useMutation(
        trpc.scheduler.update.mutationOptions({
            onSuccess: () => {
                toast.success("Schedule updated");
            },
            onError: (error) => {
                toast.error(
                    error.message ?? "Failed to update schedule"
                );
            },
        })
    );
};


export const useActivateSchedule = () => {
    const trpc = useTRPC();

    return useMutation(
        trpc.scheduler.activate.mutationOptions({
            onSuccess: () => {
                toast.success("Schedule activated");
            },
            onError: (error) => {
                toast.error(
                    error.message ?? "Failed to activate schedule"
                );
            },
        })
    );
};


export const useScheduleByNode = (nodeId: string) => {
    const trpc = useTRPC();

    return useQuery(
        trpc.scheduler.getScheduleByNode.queryOptions({ nodeId })
    );
};


export const useDeleteSchedule = () => {
    const trpc = useTRPC();

    return useMutation(
        trpc.scheduler.deleteSchedule.mutationOptions({
            onSuccess: () => {
                toast.success("Schedule deleted");
            },
            onError: (error) => {
                console.log(error)
                // toast.error(error.message ?? "Failed to delete schedule");
            },
        })
    );
};