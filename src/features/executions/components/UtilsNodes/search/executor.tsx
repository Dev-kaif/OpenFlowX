import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { searchChannel } from "@/inngest/channels/search";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";
import ky from "ky";

type SearchNodeData = {
    query?: string;
    variableName?: string;
    credentialId?: string;
};

export const SearchExecutor: NodeExecutor<SearchNodeData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    await publish(
        searchChannel().status({
            nodeId,
            status: "loading",
        })
    );

    // Validation
    if (!data.variableName) {
        await publish(
            searchChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Search Node: variableName is required");
    }

    if (!data.query) {
        await publish(
            searchChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Search Node: query is required");
    }

    try {
        // Resolve API Key: Try Database first, then Fallback to ENV
        const apiKey = await step.run("get-api-key", async () => {
            // If user selected a specific credential
            if (data.credentialId) {
                const cred = await prisma.credential.findUnique({
                    where: {
                        id: data.credentialId,
                        userId
                    },
                    select: { value: true }
                });

                if (cred) {
                    return decryptApiKey(cred.value);
                }
            }

            // Fallback to System Environment Variable
            const systemKey = process.env.TAVILY_API_KEY;
            if (!systemKey) {
                throw new Error("No Tavily API key found (System or User)");
            }
            return systemKey;
        });

        // Resolve Handlebars Query
        const query = Handlebars.compile(data.query, {
            noEscape: true,
        })(context).trim();

        if (!query) {
            throw new NonRetriableError("Search Node: resolved query is empty");
        }

        // Execute Search via Tavily
        const result = await step.run("tavily-search", async () => {
            try {
                const searchData = await ky.post("https://api.tavily.com/search", {
                    json: {
                        api_key: apiKey,
                        query: query,
                        search_depth: "basic",
                        max_results: 5,
                    },
                }).json<any>();

                // Mapping results to a clean format for the next nodes
                const mappedResults = (searchData.results || []).map((r: any) => ({
                    title: r.title,
                    url: r.url,
                    snippet: r.content,
                    score: r.score
                }));

                return {
                    query,
                    results: mappedResults,
                    count: mappedResults.length,
                    text: mappedResults.map((r: any) => `${r.title}\n${r.url}\n${r.snippet}`).join("\n\n")
                };
            } catch (error: any) {
                if (error.name === 'HTTPError') {
                    const errorData = await error.response.json();
                    throw new Error(`Tavily API failed (${error.response.status}): ${JSON.stringify(errorData)}`);
                }
                throw error;
            }
        });

        await publish(
            searchChannel().status({
                nodeId,
                status: "success",
            })
        );

        return {
            [data.variableName]: result,
        };
    } catch (error: any) {
        await publish(
            searchChannel().status({
                nodeId,
                status: "error",
            })
        );

        if (error.message.includes("401") || error.message.includes("403")) {
            throw new NonRetriableError(`Search Error (Auth): ${error.message}`);
        }

        throw error;
    }
};