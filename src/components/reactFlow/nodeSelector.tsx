import { NodeType } from "@/generated/prisma/enums";
import { createId } from "@paralleldrive/cuid2";
import { GlobeIcon, MousePointerIcon } from "lucide-react";
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
]

const executionNode: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        lable: "HTTP Request",
        description: "makes an HTTP request",
        icon: GlobeIcon,
    },
    {
        type: NodeType.GEMINI,
        lable: "Gemini",
        description: "makes an Request to Gemini Api",
        icon: "/gemini.svg",
    },
    {
        type: NodeType.OPENROUTER,
        lable: "Open Router",
        description: "makes an Request to OpenRouter Api",
        icon: "/openrouter.svg",
    },
    {
        type: NodeType.OPENAI,
        lable: "Open AI",
        description: "makes an Request to Open AI Api",
        icon: "/openai.svg",
    },
    {
        type: NodeType.DEEPSEEK,
        lable: "Deepseek",
        description: "makes an Request to Deepseek Api",
        icon: "/deepseek.svg",
    },
    {
        type: NodeType.ANTHROPIC,
        lable: "Anthropic",
        description: "makes an Request to Anthropic Api",
        icon: "/anthropic.svg",
    },
    {
        type: NodeType.XAI,
        lable: "Grok",
        description: "makes an Request to Grok Api",
        icon: "/grok.svg",
    },
    {
        type: NodeType.DISCORD,
        lable: "Discord",
        description: "makes an Request to Grok Api",
        icon: "/discord.svg",
    },
    {
        type: NodeType.SLACK,
        lable: "Slack",
        description: "makes an Request to Grok Api",
        icon: "/slack.svg",
    },
]

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

