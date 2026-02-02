import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetSettings = () => {
    const trpc = useTRPC()
    return useSuspenseQuery(trpc.settings.getSettings.queryOptions());
}

export const useRevokeSession = () => {
    const trpc = useTRPC();
    const queryCLient = useQueryClient()
    return useMutation(trpc.settings.revokeSession.mutationOptions({
        onSuccess: () => {
            toast.success("Session revoked");
            queryCLient.invalidateQueries(trpc.settings.getSettings.queryOptions())
        }
    })
    )
}

export const useUnlinkAccount = () => {
    const trpc = useTRPC();
    const queryCLient = useQueryClient()

    return useMutation(trpc.settings.unlinkAccount.mutationOptions({
        onSuccess: () => {
            toast.success("Account disconnected");
            queryCLient.invalidateQueries(trpc.settings.getSettings.queryOptions())
        }
    }
    ));
}

export const useGetTelegramLink = () => {
    const trpc = useTRPC();
    return useQuery(trpc.settings.getConnectLink.queryOptions());
}

export const useGetTelegramStatus = () => {
    const trpc = useTRPC();
    return useSuspenseQuery(
        trpc.settings.getTelegramStatus.queryOptions(),
    );
};

export const useDisconnectTelegram = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.settings.disconnectTelegram.mutationOptions({
            onSuccess: () => {
                toast.success("Telegram disconnected");
                queryClient.invalidateQueries(
                    trpc.settings.getTelegramStatus.queryOptions(),
                );
            },
            onError: (err) => {
                toast.error(err.message ?? "Failed to disconnect Telegram");
            },
        }),
    );
};

export const useDeleteTelegramConnection = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.settings.deleteTelegramConnection.mutationOptions({
            onSuccess: () => {
                toast.success("Telegram connection removed");
                queryClient.invalidateQueries(
                    trpc.settings.getTelegramStatus.queryOptions(),
                );
            },
            onError: (err) => {
                toast.error(err.message ?? "Failed to remove Telegram connection");
            },
        }),
    );
};