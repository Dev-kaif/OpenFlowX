import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { scraperChannel } from "@/inngest/channels/scraper";

type ScraperNodeData = {
    url?: string;
    variableName?: string;
    minContentLength?: number;
    maxUrls?: number;
};

const SCRAPINGBEE_API = "https://app.scrapingbee.com/api/v1/";
const SCRAPINGBEE_KEY = process.env.SCRAPINGBEE_API_KEY;
const MIN_MEANINGFUL_CONTENT = 200;

async function scrapeSingleUrl(url: string): Promise<{
    text: string;
    metadata: any;
    success: boolean;
    contentLength: number;
}> {
    if (!SCRAPINGBEE_KEY) {
        return {
            text: "Error: SCRAPINGBEE_API_KEY not configured",
            metadata: { title: "Configuration Error", url },
            success: false,
            contentLength: 0,
        };
    }

    try {
        const apiUrl =
            `${SCRAPINGBEE_API}?` +
            new URLSearchParams({
                api_key: SCRAPINGBEE_KEY,
                url,
                render_js: "true",
                wait: "3000",
                block_ads: "true",
                block_resources: "false",
            });

        const res = await fetch(apiUrl, {
            signal: AbortSignal.timeout(30000)
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => "Unknown error");
            return {
                text: `Error: HTTP ${res.status} - ${errorText}`,
                metadata: { title: "Fetch Error", url },
                success: false,
                contentLength: 0,
            };
        }

        const html = await res.text();

        if (!html || html.length < 50) {
            return {
                text: "Error: Empty or invalid response from ScrapingBee",
                metadata: { title: "Invalid Response", url },
                success: false,
                contentLength: 0,
            };
        }

        const dom = new JSDOM(html, { url });
        const doc = dom.window.document;
        const reader = new Readability(doc);
        const article = reader.parse();

        let text = "";
        let title = doc.title || "Untitled";

        if (article?.content && article.content.length > 100) {
            const turndown = new TurndownService({
                headingStyle: "atx",
                codeBlockStyle: "fenced",
            });
            text = turndown.turndown(article.content);
            title = article.title || title;
        } else {
            const bodyText = doc.body?.textContent || "";
            text = bodyText
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 10000);
        }

        const contentLength = text.length;
        const success = contentLength >= MIN_MEANINGFUL_CONTENT &&
            !text.startsWith("Error:") &&
            text !== "No meaningful content extracted";

        return {
            text,
            metadata: { title, url },
            success,
            contentLength,
        };

    } catch (err: any) {
        return {
            text: `Error scraping: ${err.message}`,
            metadata: { title: "Error", url },
            success: false,
            contentLength: 0,
        };
    }
}

// Helper function to extract URL from various formats
function extractUrl(item: any): string {
    if (typeof item === "string") {
        return item;
    }

    if (item && typeof item === "object") {
        const urlCandidate =
            (item as any).url ||
            (item as any).link ||
            (item as any).href ||
            (item as any).URL ||
            (item as any).Link ||
            (item as any).Href;

        return typeof urlCandidate === "string" ? urlCandidate : "";
    }

    return "";
}

// Helper to resolve variable path from context
function resolveVariablePath(path: string, context: any): any {
    // Remove {{ }} if present
    const cleanPath = path.replace(/\{\{|\}\}/g, '').trim();

    // Split by dots and resolve
    const parts = cleanPath.split('.');
    let result = context;

    for (const part of parts) {
        // Handle array access like results[0]
        const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/);
        if (arrayMatch) {
            const [, key, index] = arrayMatch;
            result = result?.[key]?.[parseInt(index)];
        } else {
            result = result?.[part];
        }

        if (result === undefined || result === null) {
            break;
        }
    }

    return result;
}

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

        // Resolve the input - check if it's a variable reference first
        let resolved: any;

        if (data.url.trim().startsWith("{{") && data.url.trim().endsWith("}}")) {
            // It's a variable reference - resolve directly from context
            resolved = resolveVariablePath(data.url, context);
        } else {
            // Use Handlebars for other cases
            const compiled = Handlebars.compile(data.url, { noEscape: true });
            resolved = compiled(context);
        }

        console.log("Resolved type:", typeof resolved);
        console.log("Resolved value:", Array.isArray(resolved) ? `Array(${resolved.length})` : resolved);

        // Extract URLs from various input formats
        let allUrls: string[] = [];

        if (Array.isArray(resolved)) {
            // It's an array - extract URLs from each item
            allUrls = resolved
                .map((item) => extractUrl(item))
                .filter((u): u is string =>
                    typeof u === "string" &&
                    u.trim().length > 0 &&
                    (u.startsWith("http://") || u.startsWith("https://"))
                )
                .slice(0, maxUrlsToTry);
        } else if (typeof resolved === "string") {
            // Single string URL
            if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
                allUrls = [resolved];
            }
        } else if (resolved && typeof resolved === "object") {
            // Single object with URL property
            const url = extractUrl(resolved);
            if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
                allUrls = [url];
            }
        }

        if (allUrls.length === 0) {
            await publish(scraperChannel().status({ nodeId, status: "error" }));

            // Better error message with debugging info
            console.error("Failed to extract URLs.");
            console.error("Input:", data.url);
            console.error("Resolved type:", typeof resolved);
            console.error("Is array:", Array.isArray(resolved));
            if (Array.isArray(resolved) && resolved.length > 0) {
                console.error("First item:", resolved[0]);
            }

            throw new NonRetriableError(
                `Scraper Node: No valid URLs found in input. Received ${typeof resolved}${Array.isArray(resolved) ? ` with ${resolved.length} items` : ''}. Make sure URLs start with http:// or https://`
            );
        }

        console.log(`Found ${allUrls.length} valid URLs to scrape`);

        const result = await step.run("scrape-pages", async () => {
            const successfulPages = [];
            const failedPages = [];

            for (const url of allUrls) {
                console.log(`Attempting to scrape: ${url}`);

                const pageResult = await scrapeSingleUrl(url);

                if (pageResult.success && pageResult.contentLength >= minContentLength) {
                    successfulPages.push(pageResult);
                    console.log(`✓ Successfully scraped: ${url} (${pageResult.contentLength} chars)`);

                    if (successfulPages.length >= 2) {
                        break;
                    }
                } else {
                    failedPages.push(pageResult);
                    console.log(`✗ Failed to scrape: ${url} (${pageResult.contentLength} chars)`);
                }

                if (allUrls.indexOf(url) < allUrls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            const pagesToReturn = successfulPages.length > 0 ? successfulPages : failedPages;

            const combinedText = pagesToReturn
                .map((p, i) =>
                    `--- SOURCE ${i + 1}: ${p.metadata.title} (${p.metadata.url}) ---\n${p.text}`
                )
                .join("\n\n");

            return {
                text: combinedText,
                pages: pagesToReturn,
                successfulCount: successfulPages.length,
                attemptedCount: successfulPages.length + failedPages.length,
                totalAvailableUrls: allUrls.length,
                count: pagesToReturn.length,
                source: "scrapingbee",
            };
        });

        if (result.successfulCount === 0) {
            console.warn(`Warning: No meaningful content extracted from ${result.attemptedCount} URLs`);
        }

        await publish(scraperChannel().status({ nodeId, status: "success" }));

        return {
            [data.variableName]: result,
        };

    } catch (err: any) {
        await publish(scraperChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError(`Scraper Error: ${err.message}`);
    }
};