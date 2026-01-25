import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { Options as kyOptions } from "ky"
import Handlebars from "handlebars"


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
})

type HttpRequest = {
    variableName: string;
    endpoint: string;
    method: "GET" | "PUT" | "POST" | "PATCH" | "DELETE";
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

    if (!data.variableName) {
        throw new NonRetriableError("HTTP Request Node : No Varible Name configured");
    }

    if (!data.method) {
        throw new NonRetriableError("HTTP Request Node : Method Name configured");
    }

    const result = await step.run("Http-request-run", async () => {
        const endpoint = Handlebars.compile(data.endpoint)(context);
        const method = data.method;

        const options: kyOptions = { method };

        if (["POST", "PUT", "PATCH"].includes(method)) {
            const resolved = Handlebars.compile(data.body || "{}")(context)
            JSON.parse(resolved)
            options.body = resolved;
            options.headers = {
                "Content-Type": "application/json"
            }
        }

        const response = await ky(endpoint, options);
        const contentType = response.headers.get("Content-Type");
        const responseData = contentType?.includes("application/json") ? await response.json() : await response.text()

        const responsePayload = {
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            }
        }

        return {
            ...context,
            [data.variableName]: responsePayload
        }
    })

    // const result = await step.run("Http-Request", async () => context)
    return result;
}