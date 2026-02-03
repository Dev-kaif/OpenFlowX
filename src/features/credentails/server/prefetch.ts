import { caller, prefetch, trpc } from '@/trpc/server';
import type { inferInput } from '@trpc/tanstack-react-query';

type Input = inferInput<typeof trpc.credentials.getMany>

// this will prefetch quiries 
// we wont need to change params everytime so this generic fuction works
export const prefetchCredentials = (params: Input) => {
    return prefetch(trpc.credentials.getMany.queryOptions(params));
}

export const prefetchCredential = (id: string) => {
    return prefetch(trpc.credentials.getOne.queryOptions({ id }));
}

export const prefetchCredentialsWithDetails = async (params: Input) => {
    // First prefetch the list
    await prefetchCredentials(params);

    // Get the data
    const credentials = await caller.credentials.getMany(params);

    // Prefetch all individual credentials in parallel
    const prefetchPromises = credentials.items.map((credential) =>
        prefetchCredential(credential.id)
    );

    await Promise.all(prefetchPromises);

    return credentials;
}