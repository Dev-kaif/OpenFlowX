import { prefetch, trpc } from '@/trpc/server';
import type { inferInput } from '@trpc/tanstack-react-query';

type Input = inferInput<typeof trpc.workflows.getMany>

// this will prefetch quiries 
// we wont need to change params everytime so this generic fuction works
export const prefetchWorkflows = (params:Input) => {
    return prefetch(trpc.workflows.getMany.queryOptions(params));
}

export const prefetchWorkflow = (id:string) => {
    return prefetch(trpc.workflows.getOne.queryOptions({id}));
}