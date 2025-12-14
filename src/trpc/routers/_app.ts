import { createTRPCRouter, ProtectedProcedure } from "../init";
import { google } from "@ai-sdk/google";

import { generateText } from "ai";


export const appRouter = createTRPCRouter({

  testAi: ProtectedProcedure.query(async () => {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: "Write a vegetarian lasagna recipe for 4 people.",
    });

    return text
  })
});
// export type definition of API
export type AppRouter = typeof appRouter;
