import { NodeType } from "@/generated/prisma/enums";
import { createId } from "@paralleldrive/cuid2";
import { CodeIcon, EyeIcon, FileIcon, FileText, GlobeIcon, MousePointerIcon, Search } from "lucide-react";
import React, { useCallback } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Separator } from "../ui/separator";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
export type NodeTypeOption = {
    type: NodeType,
    lable: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;
}

const triggerNode: NodeTypeOption[] = [
    {
        type: NodeType.MANUAL_TRIGGER,
        lable: "Trigger Manually",
        description: "Runs the flow on clicking a button. Good for getting started quickly",
        icon: MousePointerIcon,
    },
    {
        type: NodeType.GOOGLE_FORM_TRIGGER,
        lable: "Google Form",
        description: "Runs the flow when a google form is submitted",
        icon: "/googleform.svg",
    },
    {
        type: NodeType.STRIPE_TRIGGER,
        lable: "Stripe",
        description: "Runs the flow when a Stripe event is received.",
        icon: "/stripe.svg",
    },
    {
        type: NodeType.POLAR_TRIGGER,
        lable: "Polar",
        description: "Runs the flow when a Polar event is received.",
        icon: "/polar.svg",
    },
    {
        type: NodeType.SCHEDULE,
        lable: "Schedule",
        description: "Runs the flow when a Polar event is received.",
        icon: "/utils/schedule.svg",
    },
]

const executionNode: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        lable: "HTTP Request",
        description: "Send an HTTP request to any REST API and use the response in your workflow",
        icon: GlobeIcon,
    },
    {
        type: NodeType.GEMINI,
        lable: "Gemini",
        description: "Generate text or structured output using Google Gemini models",
        icon: "/gemini.svg",
    },
    {
        type: NodeType.OPENROUTER,
        lable: "OpenRouter",
        description: "Call LLMs from multiple providers through the OpenRouter API",
        icon: "/openrouter.svg",
    },
    {
        type: NodeType.OPENAI,
        lable: "OpenAI",
        description: "Generate text or data using OpenAI models like GPT-4",
        icon: "/openai.svg",
    },
    {
        type: NodeType.DEEPSEEK,
        lable: "DeepSeek",
        description: "Run reasoning or code-focused prompts using DeepSeek models",
        icon: "/deepseek.svg",
    },
    {
        type: NodeType.ANTHROPIC,
        lable: "Anthropic",
        description: "Generate responses using Anthropic Claude models",
        icon: "/anthropic.svg",
    },
    {
        type: NodeType.XAI,
        lable: "Grok",
        description: "Generate text using xAI Grok models",
        icon: "/grok.svg",
    },
    {
        type: NodeType.DISCORD,
        lable: "Discord",
        description: "Send messages or notifications to a Discord channel",
        icon: "/discord.svg",
    },
    {
        type: NodeType.SLACK,
        lable: "Slack",
        description: "Post messages or alerts to a Slack workspace",
        icon: "/slack.svg",
    },
    {
        type: NodeType.IFELSE,
        lable: "If / Else",
        description: "Branch workflow execution based on a boolean condition",
        icon: "/utils/ifelse.svg",
    },
    {
        type: NodeType.DELAY,
        lable: "Delay",
        description: "Pause workflow execution for a specified amount of time",
        icon: "/utils/delay.svg",
    },
    {
        type: NodeType.CODE,
        lable: "Code",
        description: "Run custom JavaScript logic inside the workflow",
        icon: CodeIcon,
    },
    {
        type: NodeType.TEMPLATE,
        lable: "Template",
        description: "Create reusable text or data by rendering a template with workflow variables",
        icon: FileText,
    },
    {
        type: NodeType.SEARCH,
        lable: "Search",
        description: "Create reusable text or data by rendering a template with workflow variables",
        icon: Search,
    },
    {
        type: NodeType.SCRAPER,
        lable: "Scraper",
        description: "Create reusable text or data by rendering a template with workflow variables",
        icon: EyeIcon,
    },
    {
        type: NodeType.POSTGRESS,
        lable: "Postgres",
        description: "Read or write data from a Postgres database",
        icon: "/postgress.svg",
    },
    {
        type: NodeType.GOOGLESHEETS,
        lable: "Google Sheets",
        description: "Read or write data from a Postgres database",
        icon: "/sheets.svg",
    },
    {
        type: NodeType.EMAIL_RESEND,
        lable: "Resend",
        description: "Read or write data from a Postgres database",
        icon: "/resend.svg",
    },
    {
        type: NodeType.JSON_PARSE,
        lable: "Json Parsing",
        description: "Read or write data from a Postgres database",
        icon: "/utils/json.svg",
    },
    {
        type: NodeType.FILE,
        lable: "File Transform",
        description: "Read or write data from a Postgres database",
        icon: FileIcon,
    },
    {
        type: NodeType.S3,
        lable: "AWS S3",
        description: "Read or write data from a Postgres database",
        icon: "/aws.svg",
    },
    {
        type: NodeType.R2,
        lable: "Cloudflare R2",
        description: "Read or write data from a Postgres database",
        icon: "/cloudflare.svg",
    },
];

interface NodeSelectorPros {
    open: boolean,
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const NodeSelector = ({
    open,
    onOpenChange,
    children
}: NodeSelectorPros) => {
    const { getNodes, setNodes, screenToFlowPosition } = useReactFlow();

    const handleNodeSelect = useCallback((selection: NodeTypeOption) => {
        if (selection.type == NodeType.MANUAL_TRIGGER) {
            const nodes = getNodes();

            const hasManualTrigger = nodes.some((node) => (
                node.type == NodeType.MANUAL_TRIGGER
            ));

            if (hasManualTrigger) {
                toast.error("There can be only one Manual Trigger");
                return;
            }
        }
        setNodes((nodes) => {
            const hasInitialNode = nodes.some((node) => (
                node.type == NodeType.INITIAL
            ));

            const CenterX = window.innerWidth / 2;
            const CenterY = window.innerHeight / 2;

            const flowPosition = screenToFlowPosition({
                x: CenterX + (Math.random() - 0.5) * 200,
                y: CenterY + (Math.random() - 0.5) * 200
            });

            const newNode = {
                id: createId(),
                data: {},
                position: flowPosition,
                type: selection.type
            };

            if (hasInitialNode) {
                return [newNode]
            }

            return [...nodes, newNode]
        })

        onOpenChange(false);

    }, [getNodes, onOpenChange, screenToFlowPosition, setNodes]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        what triggers this workflow?
                    </SheetTitle>
                    <SheetDescription>
                        A trigger is step that starts your workflow
                    </SheetDescription>
                </SheetHeader>
                <div>
                    {triggerNode.map((nodeType, index) => {
                        const Icon = nodeType.icon;
                        return (
                            <div
                                key={index}
                                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() => handleNodeSelect(nodeType)}
                            >
                                <div className="flex items-center overflow-hidden w-full gap-6">
                                    {typeof Icon == "string" ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={Icon}
                                            alt={nodeType.lable}
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ) : (
                                        <Icon className="size-5" />
                                    )}
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium text-sm">
                                            {nodeType.lable}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {nodeType.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Separator />
                <div>
                    {executionNode.map((nodeType, index) => {
                        const Icon = nodeType.icon;
                        return (
                            <div
                                key={index}
                                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() => handleNodeSelect(nodeType)}
                            >
                                <div className="flex items-center overflow-hidden w-full gap-6">
                                    {typeof Icon == "string" ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={Icon}
                                            alt={nodeType.lable}
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ) : (
                                        <Icon className="size-5" />
                                    )}
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-medium text-sm">
                                            {nodeType.lable}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {nodeType.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SheetContent>
        </Sheet>
    );
}

