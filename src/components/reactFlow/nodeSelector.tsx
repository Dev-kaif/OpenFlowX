import { NodeType } from "@/generated/prisma/enums";
import { createId } from "@paralleldrive/cuid2";
import {
    CodeIcon,
    EyeIcon,
    FileIcon,
    FileText,
    GlobeIcon,
    MousePointerIcon,
    SearchIcon,
} from "lucide-react";
import React, { useCallback, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";


export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;
};


const triggerNodes: NodeTypeOption[] = [
    {
        type: NodeType.MANUAL_TRIGGER,
        label: "Manual Trigger",
        description: "Start the workflow manually with a button click",
        icon: MousePointerIcon,
    },
    {
        type: NodeType.GOOGLE_FORM_TRIGGER,
        label: "Google Form",
        description: "Trigger when a Google Form is submitted",
        icon: "/googleform.svg",
    },
    {
        type: NodeType.STRIPE_TRIGGER,
        label: "Stripe",
        description: "Trigger on Stripe events like payments",
        icon: "/stripe.svg",
    },
    {
        type: NodeType.POLAR_TRIGGER,
        label: "Polar",
        description: "Trigger on Polar events",
        icon: "/polar.svg",
    },
    {
        type: NodeType.SCHEDULE,
        label: "Schedule",
        description: "Run the workflow automatically on a schedule",
        icon: "/utils/schedule.svg",
    },
];

const executionNodes: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        description: "Send HTTP requests to APIs",
        icon: GlobeIcon,
    },
    {
        type: NodeType.SEARCH,
        label: "Search",
        description: "Search the web or indexed sources and return relevant results as structured data",
        icon: SearchIcon,
    },
    {
        type: NodeType.SCRAPER,
        label: "Scraper",
        description: "Extract content and metadata from web pages using selectors or AI-based parsing",
        icon: EyeIcon,
    },
    {
        type: NodeType.GEMINI,
        label: "Gemini",
        description: "Generate text or structured output using Gemini",
        icon: "/gemini.svg",
    },
    {
        type: NodeType.OPENROUTER,
        label: "OpenRouter",
        description: "Call multiple LLM providers via OpenRouter",
        icon: "/openrouter.svg",
    },
    {
        type: NodeType.OPENAI,
        label: "OpenAI",
        description: "Generate text or JSON using OpenAI models",
        icon: "/openai.svg",
    },
    {
        type: NodeType.DEEPSEEK,
        label: "DeepSeek",
        description: "Reasoning and code-focused LLM execution",
        icon: "/deepseek.svg",
    },
    {
        type: NodeType.ANTHROPIC,
        label: "Anthropic",
        description: "Generate responses using Claude models",
        icon: "/anthropic.svg",
    },
    {
        type: NodeType.XAI,
        label: "Grok",
        description: "Generate text using xAI Grok models",
        icon: "/grok.svg",
    },
    {
        type: NodeType.DISCORD,
        label: "Discord",
        description: "Send messages or notifications to Discord",
        icon: "/discord.svg",
    },
    {
        type: NodeType.SLACK,
        label: "Slack",
        description: "Send messages or alerts to Slack",
        icon: "/slack.svg",
    },
    {
        type: NodeType.TELEGRAM,
        label: "Telegram",
        description: "Send messages or alerts to Telegram",
        icon: "/telegram.svg",
    },
    {
        type: NodeType.EMAIL_RESEND,
        label: "Resend Email",
        description: "Send transactional emails using Resend",
        icon: "/resend.svg",
    },
    {
        type: NodeType.POSTGRESS,
        label: "Postgres",
        description: "Read or write data in a Postgres database",
        icon: "/postgress.svg",
    },
    {
        type: NodeType.GOOGLESHEETS,
        label: "Google Sheets",
        description: "Read or write rows in Google Sheets",
        icon: "/sheets.svg",
    },
    {
        type: NodeType.S3,
        label: "AWS S3",
        description: "Upload files to Amazon S3",
        icon: "/aws.svg",
    },
    {
        type: NodeType.R2,
        label: "Cloudflare R2",
        description: "Upload files to Cloudflare R2",
        icon: "/cloudflare.svg",
    },
];

const utilNodes: NodeTypeOption[] = [
    {
        type: NodeType.IFELSE,
        label: "If / Else",
        description: "Branch execution based on a condition",
        icon: "/utils/ifelse.svg",
    },
    {
        type: NodeType.DELAY,
        label: "Delay",
        description: "Pause workflow execution for a duration",
        icon: "/utils/delay.svg",
    },
    {
        type: NodeType.CODE,
        label: "Code",
        description: "Run custom JavaScript logic",
        icon: CodeIcon,
    },
    {
        type: NodeType.TEMPLATE,
        label: "Template",
        description: "Render text using Handlebars templates",
        icon: FileText,
    },
    {
        type: NodeType.JSON_PARSE,
        label: "JSON Parse",
        description: "Parse a JSON string into structured data",
        icon: "/utils/json.svg",
    },
    {
        type: NodeType.FILE,
        label: "File",
        description: "Normalize files from URL, base64, or metadata",
        icon: FileIcon,
    },
];


interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const NodeSelector = ({
    open,
    onOpenChange,
    children,
}: NodeSelectorProps) => {
    const { getNodes, setNodes, screenToFlowPosition } = useReactFlow();
    const [search, setSearch] = useState("");

    const filterBySearch = (nodes: NodeTypeOption[]) => {
        if (!search.trim()) return nodes;
        return nodes.filter((n) =>
            n.label.toLowerCase().includes(search.toLowerCase())
        );
    };

    const handleNodeSelect = useCallback(
        (selection: NodeTypeOption) => {
            if (selection.type === NodeType.MANUAL_TRIGGER) {
                const nodes = getNodes();
                if (nodes.some((n) => n.type === NodeType.MANUAL_TRIGGER)) {
                    toast.error("There can be only one Manual Trigger");
                    return;
                }
            }

            setNodes((nodes) => {
                const hasInitialNode = nodes.some(
                    (n) => n.type === NodeType.INITIAL
                );

                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;

                const position = screenToFlowPosition({
                    x: centerX + (Math.random() - 0.5) * 200,
                    y: centerY + (Math.random() - 0.5) * 200,
                });

                const newNode = {
                    id: createId(),
                    data: {},
                    position,
                    type: selection.type,
                };

                // 🔥 PRESERVED LOGIC
                if (hasInitialNode) return [newNode];

                return [...nodes, newNode];
            });

            onOpenChange(false);
        },
        [getNodes, onOpenChange, screenToFlowPosition, setNodes]
    );

    const hasResults =
        filterBySearch(triggerNodes).length ||
        filterBySearch(executionNodes).length ||
        filterBySearch(utilNodes).length;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add a node</SheetTitle>
                    <SheetDescription>
                        Choose what happens in your workflow
                    </SheetDescription>
                </SheetHeader>

                {/* Search */}
                <div className="px-4 py-2">
                    <Input
                        placeholder="Search nodes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9"
                    />
                </div>

                {/* Triggers */}
                <Section title="Triggers">
                    {filterBySearch(triggerNodes).map((n, i) => (
                        <NodeItem key={i} node={n} onClick={handleNodeSelect} />
                    ))}
                </Section>

                <Separator />

                {/* Actions */}
                <Section title="Actions">
                    {filterBySearch(executionNodes).map((n, i) => (
                        <NodeItem key={i} node={n} onClick={handleNodeSelect} />
                    ))}
                </Section>

                <Separator />

                {/* Utils */}
                <Section title="Utils">
                    {filterBySearch(utilNodes).map((n, i) => (
                        <NodeItem key={i} node={n} onClick={handleNodeSelect} />
                    ))}
                </Section>

                {/* Empty State */}
                {!hasResults && search && (
                    <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                        No nodes found for “{search}”
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};


const Section = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div className="mt-2">
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
            {title}
        </div>
        {children}
    </div>
);

const NodeItem = ({
    node,
    onClick,
}: {
    node: NodeTypeOption;
    onClick: (node: NodeTypeOption) => void;
}) => {
    const Icon = node.icon;

    return (
        <div
            className="w-full py-4 px-4 cursor-pointer border-l-2 border-transparent hover:border-l-primary"
            onClick={() => onClick(node)}
        >
            <div className="flex gap-6 items-center">
                {typeof Icon === "string" ? (
                    <img src={Icon} alt={node.label} className="size-5" />
                ) : (
                    <Icon className="size-5" />
                )}
                <div>
                    <div className="font-medium text-sm">{node.label}</div>
                    <div className="text-xs text-muted-foreground">
                        {node.description}
                    </div>
                </div>
            </div>
        </div>
    );
};
