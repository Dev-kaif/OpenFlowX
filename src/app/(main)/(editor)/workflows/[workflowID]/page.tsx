import { RequiredAuth } from '@/lib/authUtil';
import { prefetchWorkflow } from '@/features/workflows/server/prefetch';
import { HydrateClient } from '@/trpc/server';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import { Editor, EditorError, EditorLoading} from '@/features/editor/components/editorComponents';
import { EditorHeader } from '@/features/editor/components/editorHeader';

interface PageProps{
  params: Promise<{
    workflowID:string
  }>
}

async function Page({ params }: PageProps) {

  await RequiredAuth();


  const { workflowID } = await params;
  prefetchWorkflow(workflowID);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError/>}>
        <Suspense fallback={<EditorLoading />}>
          <EditorHeader workflowId={workflowID}/>
          <main className='flex-1'>
            <Editor workflowId={workflowID} />
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;