import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { scraperChannel } from "@/inngest/channels/scraper";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";
import {
    extractUrl,
    MIN_MEANINGFUL_CONTENT,
    resolveVariablePath,
    scrapeSingleUrl,
} from "./utils";

type ScraperNodeData = {
    url?: string;
    variableName?: string;
    credentialId?: string;
    minContentLength?: number;
    maxUrls?: number;
};

export const ScraperExecutor: NodeExecutor<ScraperNodeData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    await publish(
        scraperChannel().status({
            nodeId,
            status: "loading",
        })
    );

    // Validation
    if (!data.variableName) {
        await publish(
            scraperChannel().status({ nodeId, status: "error" })
        );
        throw new NonRetriableError("Scraper Node: variableName is required");
    }

    if (!data.url) {
        await publish(
            scraperChannel().status({ nodeId, status: "error" })
        );
        throw new NonRetriableError("Scraper Node: url is required");
    }

    try {
        const apiKey = await step.run("get-scrapingbee-api-key", async () => {
            // User-provided credential
            if (data.credentialId) {
                const cred = await prisma.credential.findUnique({
                    where: {
                        id: data.credentialId,
                        userId,
                    },
                    select: { value: true },
                });

                if (cred) {
                    return decryptApiKey(cred.value);
                }
            }

            // Fallback to system key
            const systemKey = process.env.SCRAPINGBEE_API_KEY;
            if (!systemKey) {
                throw new Error(
                    "No ScrapingBee API key found (System or User)"
                );
            }

            return systemKey;
        });

        let resolved: any;

        const rawUrl = data.url.trim();

        if (rawUrl.startsWith("{{") && rawUrl.endsWith("}}")) {
            resolved = resolveVariablePath(rawUrl, context);
        } else {
            resolved = Handlebars.compile(rawUrl, { noEscape: true })(context);
        }

        const maxUrlsToTry = data.maxUrls ?? 3;
        const minContentLength =
            data.minContentLength ?? MIN_MEANINGFUL_CONTENT;

        let allUrls: string[] = [];

        if (Array.isArray(resolved)) {
            allUrls = resolved
                .map(extractUrl)
                .filter(
                    (u): u is string =>
                        typeof u === "string" && u.startsWith("http")
                )
                .slice(0, maxUrlsToTry);
        } else if (typeof resolved === "string" && resolved.startsWith("http")) {
            allUrls = [resolved];
        } else if (resolved && typeof resolved === "object") {
            const extracted = extractUrl(resolved);
            if (extracted.startsWith("http")) {
                allUrls = [extracted];
            }
        }

        if (allUrls.length === 0) {
            throw new NonRetriableError(
                "Scraper Node: No valid URLs found in input"
            );
        }


        const result = await step.run("scrape-pages", async () => {
            const successfulPages: any[] = [];
            const failedPages: any[] = [];

            for (const url of allUrls) {
                const page = await scrapeSingleUrl(url, {
                    apiKey,
                    source: "scrapingbee",
                });

                if (
                    page.success &&
                    page.contentLength >= minContentLength
                ) {
                    successfulPages.push(page);

                    if (successfulPages.length >= 2) break;
                } else {
                    failedPages.push(page);
                }

                // Small delay to avoid rate spikes
                if (allUrls.indexOf(url) < allUrls.length - 1) {
                    await new Promise((r) => setTimeout(r, 1000));
                }
            }

            const pages = successfulPages.length
                ? successfulPages
                : failedPages;

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
                attemptedCount:
                    successfulPages.length + failedPages.length,
                totalAvailableUrls: allUrls.length,
                count: pages.length,
                source: "scrapingbee",
            };
        });

        await publish(
            scraperChannel().status({
                nodeId,
                status: "success",
            })
        );

        return {
            [data.variableName]: result,
        };
    } catch (error: any) {
        await publish(
            scraperChannel().status({
                nodeId,
                status: "error",
            })
        );

        if (
            error.message?.includes("401") ||
            error.message?.includes("403")
        ) {
            throw new NonRetriableError(
                `Scraper Error (Auth): ${error.message}`
            );
        }

        throw new NonRetriableError(`Scraper Error: ${error.message}`);
    }
};
