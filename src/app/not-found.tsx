import NotFound from "@/components/landing/NotFound/NotFound";

export default function Page() {
    return (
        <main className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-background">
            <div className="flex w-full max-w-3xl items-center justify-center px-6 text-center">
                <NotFound />
            </div>
        </main>
    );
}
