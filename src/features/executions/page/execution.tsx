'use client';

import {
    CheckCircle2Icon,
    ClockIcon,
    Loader2Icon,
    XCircleIcon,
    CopyIcon,
    ChevronDownIcon,
    ChevronRightIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useSuspenseExecution } from "../hooks/useExecution";
import { ExecutionStatus } from "@/generated/prisma/enums";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NodeIcon } from "@/lib/icon";


const statusBadgeVariant = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return "default";
        case ExecutionStatus.FAILED:
            return "destructive";
        case ExecutionStatus.RUNNING:
            return "secondary";
        case ExecutionStatus.SKIPPED:
            return "outline";
        default:
            return "outline";
    }
};

const statusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return <CheckCircle2Icon className="h-4 w-4 text-green-600" />;
        case ExecutionStatus.FAILED:
            return <XCircleIcon className="h-4 w-4 text-red-600" />;
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="h-4 w-4 text-blue-600 animate-spin" />;
        case ExecutionStatus.SKIPPED:
            return <ClockIcon className="h-4 w-4 text-muted-foreground" />;
        default:
            return null;
    }
};

const formatDuration = (startedAt: Date, completedAt: Date | null) => {
    if (!completedAt) return "—";
    return `${(completedAt.getTime() - startedAt.getTime()) / 1000} s`;
};

const copyJSON = async (data: unknown) => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success("Copied to clipboard");
};



export const ExecutionView = ({ executionId }: { executionId: string }) => {
    const { data: execution } = useSuspenseExecution(executionId);

    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [showInput, setShowInput] = useState(true);
    const [showOutput, setShowOutput] = useState(true);

    useEffect(() => {
        if (!selectedStepId && execution.executionSteps?.length) {
            setSelectedStepId(execution.executionSteps[0].id);
        }
    }, [execution.executionSteps, selectedStepId]);

    const selectedStep = execution.executionSteps.find(
        (s) => s.id === selectedStepId
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* HEADER */}
            <Card className="lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                        {statusIcon(execution.status)}
                        <div>
                            <CardTitle className="text-base">
                                {execution.workflow.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Execution {execution.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Badge variant={statusBadgeVariant(execution.status)}>
                            {execution.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* TIMELINE */}
            <Card>
                <CardHeader className="flex justify-between px-3 py-2">
                    <CardTitle className="text-sm">Execution Timeline</CardTitle>
                </CardHeader>

                <ScrollArea className="h-[70vh]">
                    <div className="px-2 space-y-1">
                        {execution.executionSteps.map(step => (
                            <button
                                key={step.id}
                                onClick={() => setSelectedStepId(step.id)}
                                className={cn(
                                    "w-full text-left px-2 py-1.5 rounded-sm border-l-2 transition",
                                    step.id === selectedStepId
                                        ? "bg-muted/50 border-l-primary"
                                        : "border-l-transparent hover:bg-muted/30"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium">
                                            #{step.stepIndex}
                                        </span>
                                        <NodeIcon type={step.nodeType} />
                                        <span className="text-xs font-medium">
                                            {step.nodeName}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatDuration(step.startedAt, step.completedAt)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* DETAILS */}
            <Card className="lg:col-span-2 min-w-0">
                <CardHeader className="sticky top-0 z-10 bg-background px-3 border-b">
                    <CardTitle className="text-sm flex gap-x-2">
                        <NodeIcon type={selectedStep?.nodeType!} />
                        {selectedStep?.nodeName ?? "Step details"}
                    </CardTitle>
                </CardHeader>
                <ScrollArea className="h-[70vh]">
                    <div className="px-3 py-2 space-y-3">
                        {selectedStep && (
                            <>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant={statusBadgeVariant(selectedStep.status)}>
                                        Node {selectedStep.status}
                                    </Badge>
                                </div>
                                <Separator />
                                {/* INPUT */}
                                {selectedStep.input && (
                                    <div className="space-y-1">
                                        <button
                                            className="flex items-center gap-1 text-xs font-medium"
                                            onClick={() => setShowInput(v => !v)}
                                        >
                                            {showInput ? (
                                                <ChevronDownIcon className="h-3 w-3" />
                                            ) : (
                                                <ChevronRightIcon className="h-3 w-3" />
                                            )}
                                            Input
                                        </button>

                                        {showInput && (
                                            <div className="relative">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                                                    onClick={() => copyJSON(selectedStep.input)}
                                                >
                                                    <CopyIcon className="h-3 w-3" />
                                                </Button>

                                                <pre className="text-[11px] bg-muted/40 border rounded-md px-3 py-2 max-h-[240px] overflow-auto font-mono whitespace-pre-wrap wrap-break-word pr-8">
                                                    {JSON.stringify(selectedStep.input, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* OUTPUT */}
                                {selectedStep.output && (
                                    <div className="space-y-1">
                                        <button
                                            className="flex items-center gap-1 text-xs font-medium"
                                            onClick={() => setShowOutput(v => !v)}
                                        >
                                            {showOutput ? (
                                                <ChevronDownIcon className="h-3 w-3" />
                                            ) : (
                                                <ChevronRightIcon className="h-3 w-3" />
                                            )}
                                            Output
                                        </button>

                                        {showOutput && (
                                            <div className="relative">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                                                    onClick={() => copyJSON(selectedStep.output)}
                                                >
                                                    <CopyIcon className="h-3 w-3" />
                                                </Button>

                                                <pre className=" text-[11px] bg-muted/40 border rounded-md px-3 py-2 max-h-[240px] overflow-auto font-mono whitespace-pre-wrap wrap-break-word pr-8">
                                                    {JSON.stringify(selectedStep.output, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </>
                        )}
                    </div>
                </ScrollArea>
            </Card>
        </div>
    );
};