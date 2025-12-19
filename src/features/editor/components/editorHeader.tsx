"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useSuspenseWorkflow, useUpdateWorkflowName } from "@/features/workflows/hooks/useWorkflows";
import { SaveIcon } from "lucide-react"
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export const EditorSaveButton = ({ id }: { id: string }) => {
    return (
        <div className="ml-auto">
            <Button
                size={"sm"}
                onClick={() => { }}
                disabled={false}
            >
                <SaveIcon className="size-4" />
                Save
            </Button>
        </div>
    );
};


export const EditorBreadcumbs = ({ id }: { id: string }) => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link prefetch href={"/workflows"}>
                            Workflows
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <EditorNameInput id={id} />
            </BreadcrumbList>
        </Breadcrumb>
    )
}


export const EditorNameInput = ({ id }: { id: string }) => {
    const { data: workflow } = useSuspenseWorkflow(id);
    const updateWorkflowName = useUpdateWorkflowName();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [workflowName, setWorkflowName] = useState<string>("");

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (workflow.name) {
            setWorkflowName(workflow.name)
        }
    }, [workflow.name])
    
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing])
    
    const handleSave = async () => {
        if (workflowName == workflow.name) {
            setIsEditing(false)
            return;
        };

        try {
            await updateWorkflowName.mutateAsync({
                id: workflow.id,
                name: workflowName
            });
        } catch {
            setWorkflowName(workflow.name)
        } finally {
            setIsEditing(false)
        };
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSave();
        } else if (event.key === "Escape") {
            setWorkflowName(workflow.name);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                value={workflowName}
                onKeyDown={handleKeyDown}
                onChange={(e) => setWorkflowName(e.target.value)}
                onBlur={handleSave}
                disabled={updateWorkflowName.isPending}
                className="h-7 w-auto min-w-[100px] px-2"
            />
        );
    };


    return (
        <BreadcrumbItem
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:text-foreground transition-colors"
        >
            {workflow.name}
        </BreadcrumbItem>
    )
}


export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
    return (
        <header className='flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background'>
            <SidebarTrigger />
            <div className="flex flex-row items-center justify-between gap-x-4 w-full">
                <EditorBreadcumbs id={workflowId} />
                <EditorSaveButton id={workflowId} />
            </div>
        </header>
    )
}