import { ExecutionsContainer, ExecutionsError, ExecutionsList, ExecutionsLoading } from "@/features/executions/page/executions";
import { executionsParamsLoader } from "@/features/executions/server/paramLoader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { RequiredAuth } from "@/lib/authUtil";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
  await RequiredAuth();

  const params = await executionsParamsLoader(searchParams);
  prefetchExecutions(params);

  return (
    <ExecutionsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<ExecutionsError />}>
          <Suspense fallback={<ExecutionsLoading />}>
            <ExecutionsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </ExecutionsContainer>
  );
}

export default Page;