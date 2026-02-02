import type { inferRouterOutputs, inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "./routers/_app";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;