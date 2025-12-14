import { createOpenAI } from "@ai-sdk/openai";

const openRouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!
});

export default openRouter;
