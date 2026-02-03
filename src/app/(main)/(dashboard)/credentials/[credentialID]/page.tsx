import { CredentialView } from "@/features/credentails/components/credentialForm";
import { CredentialError, CredentialLoading } from "@/features/credentails/components/credentials";
import { RequiredAuth } from "@/lib/authUtil";
import { HydrateClient } from "@/trpc/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
// import { prefetchCredential } from "@/features/credentails/server/prefetch";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  console.log("[Page] Component executing");

  await RequiredAuth();

  const resolvedParams = await params;
  const credentialId = resolvedParams?.credentialId;

  console.log("[Page] credentialId:", credentialId);

  if (!credentialId || typeof credentialId !== "string") {
    console.error("[Page] Invalid credentialId, calling notFound()");
    notFound();
  }

  // await prefetchCredential(credentialId);

  console.log("[Page] Rendering with credentialId:", credentialId);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-3xl min-h-full flex flex-col gap-y-8 h-full">
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