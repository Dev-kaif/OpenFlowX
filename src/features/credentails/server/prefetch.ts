import { prefetch, trpc } from '@/trpc/server';
import type { inferInput } from '@trpc/tanstack-react-query';

type Input = inferInput<typeof trpc.credentials.getMany>

// this will prefetch quiries 
// we wont need to change params everytime so this generic fuction works
export const prefetchCredentails = (params: Input) => {
    return prefetch(trpc.credentials.getMany.queryOptions(params));
}

export const prefetchCredentail = (id: string) => {
    return prefetch(trpc.credentials.getOne.queryOptions({ id }));
}