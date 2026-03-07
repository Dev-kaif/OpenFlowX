import { NodeType } from "@/generated/prisma/enums";

type JSONSchemaPropertyType = "string" | "number" | "boolean" | "object" | "array" | "null";

type JSONSchemaProperty = {
    type: JSONSchemaPropertyType;
    description?: string;
};

export type AgentToolDefinition = {
    name: string;
    description: string;
    schema: {
        type: "object";
        properties: Record<string, JSONSchemaProperty>;
        required: string[];
    };
    mapArgs: (llmArgs: any, nodeConfig: any) => any;
};

export const AGENT_TOOLS: Partial<Record<NodeType, AgentToolDefinition>> = {

    [NodeType.SEARCH_TOOL]: {
        name: "web_search",
        description: "Search the internet for real-time or up-to-date information. Use this tool for current date/time, recent news, live events, or anything that may have changed after the model's knowledge cutoff.",
        schema: {
            type: "object",
            properties: {
                query: { type: "string", description: "The specific search query to look up." },
            },
            required: ["query"],
        },
        mapArgs: (llmArgs, nodeConfig) => ({
            ...nodeConfig,
            query: llmArgs.query,
            variableName: "agent_tool_output",
        })
    },

    [NodeType.SCRAPER_TOOL]: {
        name: "read_website",
        description: "Extract the full text content from a specific HTTP/HTTPS URL.",
        schema: {
            type: "object",
            properties: {
                url: { type: "string", description: "The full HTTP or HTTPS URL to read" },
            },
            required: ["url"],
        },
        mapArgs: (llmArgs, nodeConfig) => ({
            ...nodeConfig,
            url: llmArgs.url,
            variableName: "agent_tool_output",
        })
    },

    [NodeType.HTTP_REQUEST_TOOL]: {
        name: "make_api_call",
        description: "Make an HTTP request to an external API to fetch or send data.",
        schema: {
            type: "object",
            properties: {
                url: { type: "string", description: "The full API endpoint URL, must start with http:// or https://" },
                method: { type: "string", description: "HTTP Method: GET, POST, PUT, or DELETE" },
                body: { type: "string", description: "Optional JSON body string for POST/PUT requests" },
            },
            required: ["url", "method"],
        },
        mapArgs: (llmArgs, nodeConfig) => ({
            ...nodeConfig,
            endpoint: llmArgs.url,
            method: llmArgs.method,
            body: llmArgs.body || nodeConfig.body,
            variableName: "agent_tool_output",
        })
    },

    [NodeType.POSTGRESS_TOOL]: {
        name: "query_database",
        description: "Execute a SQL query against the connected Postgres database.",
        schema: {
            type: "object",
            properties: {
                query: { type: "string", description: "The SQL query to execute (e.g., SELECT * FROM users LIMIT 5)" },
            },
            required: ["query"],
        },
        mapArgs: (llmArgs, nodeConfig) => ({
            ...nodeConfig,
            query: llmArgs.query,
            variableName: "agent_tool_output",
        })
    },

    [NodeType.GOOGLESHEETS_TOOL]: {
        name: "manage_google_sheet",
        description: "Read data from or append data to a Google Sheet.",
        schema: {
            type: "object",
            properties: {
                action: { type: "string", description: "Action to perform: read or append" },
                values: { type: "string", description: "If appending, a JSON array string of values e.g. [\"John\", \"Doe\"]" },
            },
            required: ["action"],
        },
        mapArgs: (llmArgs, nodeConfig) => ({
            ...nodeConfig,
            action: llmArgs.action,
            values: llmArgs.values,
            variableName: "agent_tool_output",
        })
    },

    [NodeType.EMAIL_RESEND_TOOL]: {
        name: "send_email",
        description: "Send an email to a user with the generated report or notification.",
        schema: {
            type: "object",
            properties: {
                to: { type: "string", description: "Recipient email address" },
                subject: { type: "string", description: "Email subject line" },
                html: { type: "string", description: "Email body in HTML format" },
            },
            required: ["to", "subject", "html"],
        },
        mapArgs: (llmArgs, nodeConfig) => ({
            ...nodeConfig,
            to: llmArgs.to,
            subject: llmArgs.subject,
            html: llmArgs.html,
            variableName: "agent_tool_output",
        })
    },
};