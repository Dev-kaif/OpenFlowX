import TurndownService from "turndown";
import * as cheerio from "cheerio";

export const MIN_MEANINGFUL_CONTENT = 200;
const SCRAPINGBEE_API = "https://app.scrapingbee.com/api/v1/";
const SCRAPINGBEE_KEY = process.env.SCRAPINGBEE_API_KEY;

export async function scrapeSingleUrl(url: string): Promise<{
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
            signal: AbortSignal.timeout(30000),
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

        const $ = cheerio.load(html);

        // Remove junk
        $("script, style, noscript, iframe, nav, footer, header, ads").remove();

        const title =
            $("title").first().text().trim() ||
            $("h1").first().text().trim() ||
            "Untitled";

        const mainHtml =
            $("article").html() ||
            $("main").html() ||
            $("#content").html() ||
            $(".content").html() ||
            $("body").html() ||
            "";

        const turndown = new TurndownService({
            headingStyle: "atx",
            codeBlockStyle: "fenced",
        });

        let text = turndown
            .turndown(mainHtml)
            .replace(/\n{3,}/g, "\n\n")
            .trim()
            .slice(0, 10000);

        if (!text || text.length < 50) {
            text = $("body")
                .text()
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 10000);
        }

        const contentLength = text.length;
        const success =
            contentLength >= MIN_MEANINGFUL_CONTENT &&
            !text.startsWith("Error:");

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

// ---------- HELPERS ----------

export function extractUrl(item: any): string {
    if (typeof item === "string") return item;

    if (item && typeof item === "object") {
        const candidate =
            item.url ||
            item.link ||
            item.href ||
            item.URL ||
            item.Link ||
            item.Href;

        return typeof candidate === "string" ? candidate : "";
    }

    return "";
}

export function resolveVariablePath(path: string, context: any): any {
    const cleanPath = path.replace(/\{\{|\}\}/g, "").trim();
    const parts = cleanPath.split(".");
    let result = context;

    for (const part of parts) {
        const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/);
        if (arrayMatch) {
            const [, key, index] = arrayMatch;
            result = result?.[key]?.[parseInt(index)];
        } else {
            result = result?.[part];
        }

        if (result == null) break;
    }

    return result;
}