import { CredentialContainer, CredentialList } from '@/features/credentails/components/credentials';
import { credentialsParamLoader } from '@/features/credentails/server/paramsLoader';
import { prefetchCredentials, prefetchCredentialsWithDetails } from '@/features/credentails/server/prefetch';
import type { SearchParams } from 'nuqs/server';
import { HydrateClient } from '@/trpc/server';
import { ErrorBoundary } from "react-error-boundary";
import { RequiredAuth } from '@/lib/authUtil'
import { Suspense } from 'react';

type Props = {
  searchParams: Promise<SearchParams>
}

async function Page({ searchParams }: Props) {

  await RequiredAuth();

  const props = await credentialsParamLoader(searchParams);

  prefetchCredentialsWithDetails(props);
  return (
    <CredentialContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<>Error....</>}>
          <Suspense fallback={<>Loading...</>}>
            <CredentialList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </CredentialContainer>
  )
}

export default Page;
