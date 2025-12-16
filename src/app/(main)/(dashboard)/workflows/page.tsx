import { prefetchWorkflows } from '@/features/workflows/server/prefetch';
import { RequiredAuth } from '@/lib/authUtil'
import { HydrateClient } from '@/trpc/server';
import { ErrorBoundary } from "react-error-boundary";
import React, { Suspense } from 'react'
import{ WorkflowContainer, WorkflowList} from '@/features/workflows/component/WorkflowList';
import type { SearchParams } from 'nuqs/server';
import { workflowParamLoader } from '@/features/workflows/params';

type Props = {
  searchParams: Promise<SearchParams>
}

async function page({searchParams}:Props) {
  await RequiredAuth();

  const props = await workflowParamLoader(searchParams);
  
  prefetchWorkflows(props);

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
