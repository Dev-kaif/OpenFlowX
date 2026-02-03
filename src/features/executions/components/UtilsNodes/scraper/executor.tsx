import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { scraperChannel } from "@/inngest/channels/scraper";
import { extractUrl, MIN_MEANINGFUL_CONTENT, resolveVariablePath, scrapeSingleUrl } from "./utils";

type ScraperNodeData = {
    url?: string;
    variableName?: string;
    minContentLength?: number;
    maxUrls?: number;
};



export const ScraperExecutor: NodeExecutor<ScraperNodeData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(scraperChannel().status({ nodeId, status: "loading" }));

    if (!data.url) {
        await publish(scraperChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Scraper Node: URL required");
    }

    if (!data.variableName) {
        await publish(scraperChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Scraper Node: variableName required");
    }

    try {
        const minContentLength = data.minContentLength || MIN_MEANINGFUL_CONTENT;
        const maxUrlsToTry = data.maxUrls || 3;

        let resolved: any;

        if (data.url.trim().startsWith("{{") && data.url.trim().endsWith("}}")) {
            resolved = resolveVariablePath(data.url, context);
        } else {
            const compiled = Handlebars.compile(data.url, { noEscape: true });
            resolved = compiled(context);
        }

        let allUrls: string[] = [];

        if (Array.isArray(resolved)) {
            allUrls = resolved
                .map(extractUrl)
                .filter(
                    (u): u is string =>
                        typeof u === "string" &&
                        u.startsWith("http")
                )
                .slice(0, maxUrlsToTry);
        } else if (typeof resolved === "string" && resolved.startsWith("http")) {
            allUrls = [resolved];
        } else if (resolved && typeof resolved === "object") {
            const url = extractUrl(resolved);
            if (url.startsWith("http")) allUrls = [url];
        }

        if (allUrls.length === 0) {
            await publish(scraperChannel().status({ nodeId, status: "error" }));
            throw new NonRetriableError(
                "Scraper Node: No valid URLs found in input"
            );
        }

        const result = await step.run("scrape-pages", async () => {
            const successfulPages = [];
            const failedPages = [];

            for (const url of allUrls) {
                const page = await scrapeSingleUrl(url);

                if (page.success && page.contentLength >= minContentLength) {
                    successfulPages.push(page);
                    if (successfulPages.length >= 2) break;
                } else {
                    failedPages.push(page);
                }

                if (allUrls.indexOf(url) < allUrls.length - 1) {
                    await new Promise((r) => setTimeout(r, 1000));
                }
            }

            const pages = successfulPages.length ? successfulPages : failedPages;

            const combinedText = pages
                .map(
                    (p, i) =>
                        `--- SOURCE ${i + 1}: ${p.metadata.title} (${p.metadata.url}) ---\n${p.text}`
                )
                .join("\n\n");

            return {
                text: combinedText,
                pages,
                successfulCount: successfulPages.length,
                attemptedCount: successfulPages.length + failedPages.length,
                totalAvailableUrls: allUrls.length,
                count: pages.length,
                source: "scrapingbee",
            };
        });

        await publish(scraperChannel().status({ nodeId, status: "success" }));

        return {
            [data.variableName]: result,
        };
    } catch (err: any) {
        await publish(scraperChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError(`Scraper Error: ${err.message}`);
    }
};