import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { searchChannel } from "@/inngest/channels/search";
import * as cheerio from "cheerio";

type SearchNodeData = {
    query?: string;
    variableName?: string;
};

export const SearchExecutor: NodeExecutor<SearchNodeData> = async ({
    data,
    nodeId,
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

    if (!data.query) {
        await publish(
            searchChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Search Node: query is required");
    }

    if (!data.variableName) {
        await publish(
            searchChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Search Node: variableName is required");
    }

    try {
        const query = Handlebars.compile(data.query, {
            noEscape: true,
        })(context).trim();

        if (!query) {
            throw new NonRetriableError("Search Node: resolved query is empty");
        }

        const result = await step.run("web-search", async () => {
            // Use DuckDuckGo Lite (HTML version, simpler to parse)
            const res = await fetch(
                `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`Search request failed (${res.status})`);
            }

            const html = await res.text();
            const $ = cheerio.load(html);

            const results: Array<{
                title: string;
                snippet: string;
                url: string;
            }> = [];

            // DDG Lite has a super simple structure
            $('tr').each((i, elem) => {
                const $row = $(elem);
                const $link = $row.find('a.result-link');
                const $snippet = $row.find('.result-snippet');

                if ($link.length && results.length < 10) {
                    const title = $link.text().trim();
                    const rawUrl = $link.attr('href') || '';
                    const url = cleanDuckDuckGoUrl(rawUrl);
                    const snippet = $snippet.text().trim();

                    if (title && url) {
                        results.push({ title, snippet, url });
                    }
                }
            });

            return {
                query,
                results,
                count: results.length,
                source: "duckduckgo-lite",
            };
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

        throw new NonRetriableError(`Search Error: ${error.message}`);
    }
};

function cleanDuckDuckGoUrl(rawUrl: string): string {
    try {
        // Handle protocol-relative URLs
        const fullUrl = rawUrl.startsWith("//")
            ? `https:${rawUrl}`
            : rawUrl;

        const url = new URL(fullUrl);

        const uddg = url.searchParams.get("uddg");
        if (uddg) {
            return decodeURIComponent(uddg);
        }

        return fullUrl;
    } catch {
        return rawUrl;
    }
}
