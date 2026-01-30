import { ExecutionView } from "@/features/executions/page/execution";
import { ExecutionsError, ExecutionsLoading } from "@/features/executions/page/executions";
import { prefetchExecution } from "@/features/executions/server/prefetch";
import { RequiredAuth } from "@/lib/authUtil";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  params: Promise<{
    executionId: string;
  }>
};

const Page = async ({ params }: PageProps) => {
  await RequiredAuth();

  const { executionId } = await params;
  prefetchExecution(executionId);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionsError />}>
            <Suspense fallback={<ExecutionsLoading />}>
              <ExecutionView executionId={executionId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;