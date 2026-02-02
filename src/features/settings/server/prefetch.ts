import { prefetch, trpc } from '@/trpc/server';


export const prefetchSettings = () => {
    return prefetch(trpc.settings.getSettings.queryOptions());
}

export const prefetchConectionStatus = () => {
    return prefetch(trpc.settings.getTelegramStatus.queryOptions());
}