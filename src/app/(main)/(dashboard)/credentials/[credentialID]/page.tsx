
import { CredentialView } from "@/features/credentails/components/credentialForm";
import { CredentialError, CredentialLoading } from "@/features/credentails/components/credentials";
import { prefetchCredential } from "@/features/credentails/server/prefetch";
import { RequiredAuth } from "@/lib/authUtil";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>
};

const Page = async ({ params }: PageProps) => {
  await RequiredAuth();

  const resolvedParams = await params;

  const credentialId = resolvedParams.credentialId;

  if (!credentialId) {
    console.error("CRITICAL: credentialId is undefined in Server Component");
  }
  prefetchCredential(credentialId);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
        <HydrateClient>
          <ErrorBoundary fallback={<CredentialError />}>
            <Suspense fallback={<CredentialLoading />}>
              <CredentialView credentialId={credentialId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;