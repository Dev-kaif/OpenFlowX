import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { Options as kyOptions } from "ky"


type HttpRequest = {
    endpoint?: string;
    method?: "GET" | "PUT" | "POST" | "PATCH" | "DELETE";
    body?: string;
}

export const httpRequestTrigger: NodeExecutor<HttpRequest> = async ({
    data,
    nodeId,
    context,
    step
}) => {

    if (!data.endpoint) {
        throw new NonRetriableError("HTTP Request Node : No endpoint configured");
    }

    const result = await step.run("Http-request-run", async () => {
        const endpoint = data.endpoint!;
        const method = data.method || "GET";

        const options: kyOptions = { method };

        if (["POST", "PUT", "PATCH"].includes(method)) {
            options.body = data.body;
        }

        const response = await ky(endpoint, options);
        const contentType = response.headers.get("Content-Type");
        const responseData = contentType?.includes("application/json") ? await response.json() : await response.text()

        return {
            ...context,
            httpsResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            }
        }
    })

    // const result = await step.run("Http-Request", async () => context)
    return result;
}