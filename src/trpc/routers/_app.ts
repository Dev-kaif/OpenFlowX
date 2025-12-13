import { baseProcedure, createTRPCRouter, ProtectedProcedure } from "../init";
export const appRouter = createTRPCRouter({
  hello: ProtectedProcedure.query(({ ctx }) => {
      return {
        greeting: `hello world ${ctx.auth.user.id}`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
