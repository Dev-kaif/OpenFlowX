import { prefetchWorkflows } from '@/features/workflows/server/prefetch';
import { RequiredAuth } from '@/lib/authUtil'
import { HydrateClient } from '@/trpc/server';
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from 'react'
import {
  WorkflowContainer,
  WorkflowError,
  WorkflowList,
  WorkflowLoading
} from '@/features/workflows/component/WorkflowComponents';
import type { SearchParams } from 'nuqs/server';
import { workflowParamLoader } from '@/features/workflows/server/paramsLoader';

type Props = {
  searchParams: Promise<SearchParams>
}

async function page({ searchParams }: Props) {
  await RequiredAuth();

  const props = await workflowParamLoader(searchParams);

  prefetchWorkflows(props);

  return (
    <WorkflowContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<WorkflowError />}>
          <Suspense fallback={<WorkflowLoading />}>
            <WorkflowList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowContainer>
  )
}

export default page
