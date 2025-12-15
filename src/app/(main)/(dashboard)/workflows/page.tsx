import { prefetchWorkflows } from '@/features/workflows/server/prefetch';
import { RequiredAuth } from '@/lib/authUtil'
import { HydrateClient } from '@/trpc/server';
import { ErrorBoundary } from "react-error-boundary";
import React, { Suspense } from 'react'
import{ WorkflowContainer, WorkflowList} from '@/features/workflows/component/WorkflowList';

async function page() {
  await RequiredAuth();

  prefetchWorkflows()

  return (
    <WorkflowContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<p>...ERROR!....</p>}>
          <Suspense fallback={<p>....LOADING.....</p>}>
            <WorkflowList/>
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowContainer>
  )
}

export default page
