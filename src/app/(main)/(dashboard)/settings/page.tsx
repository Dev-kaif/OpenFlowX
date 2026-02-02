import { prefetchConectionStatus, prefetchSettings } from "@/features/settings/server/prefetch";
import SettingsPage, { SettingsContainer, SettingsError, SettingsLoading } from "@/features/settings/Settings";
import { RequiredAuth } from "@/lib/authUtil";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";


const Page = async () => {
    await RequiredAuth();

    prefetchSettings();
    prefetchConectionStatus();
    return (
        <SettingsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<SettingsError />}>
                    <Suspense fallback={<SettingsLoading />}>
                        <SettingsPage />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </SettingsContainer>
    );
}

export default Page;