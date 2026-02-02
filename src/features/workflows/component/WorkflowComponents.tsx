"use client"
import React from 'react'
import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows, workflowNode } from '@/features/workflows/hooks/useWorkflows';
import {
    EmptyView,
    EntityContainer,
    EntityHeader,
    EntityItem,
    EntityList,
    EntityPagination,
    EntitySerach,
    ErrorView,
    LoadingView
} from '@/components/entity/entityComponents';
import { useRouter } from 'next/navigation';
import { useWorkflowParams } from '../hooks/useWorkflowParams';
import { useEntitySearch } from '@/hooks/useEntitySearch';
import { NodeType, Workflow } from '@/generated/prisma/client';
import { WorkflowIcon } from 'lucide-react';
import { formatDistanceToNow } from "date-fns";
import { toast } from 'sonner';
import { NodeIcon } from '@/lib/icon';
import { cn } from '@/lib/utils';



export const WorkflowList = () => {
    const workflows = useSuspenseWorkflows();
    return (
        <EntityList
            items={workflows.data.items}
            getKey={(workflow) => workflow.id}
            renderItem={(workflow) => <WorkflowItem data={workflow} />}
            emptyView={<WorkflowEmpty />}
        />
    )
}

export const WorkflowItem = ({ data }: { data: workflowNode }) => {
    const removeWorkflow = useRemoveWorkflow()

    const handleRemove = () => {
        removeWorkflow.mutate({ id: data.id })
    }

    return (
        <EntityItem
            href={`/workflows/${data.id}`}
            title={data.name}
            subtitle={
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })} •{' '}
                        Created {formatDistanceToNow(data.createdAt, { addSuffix: true })}
                    </span>

                    {data.nodes?.length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                            {data.nodes.length > 3 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                    +{data.nodes.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            }
            image={
                data.nodes?.length ? (
                    <StackedNodeIcons nodes={data.nodes} />
                ) : null
            }
            onRemove={handleRemove}
            isRemoving={removeWorkflow.isPending}
        />
    )
}


export const WorkflowHeader = ({ disabled }: { disabled?: boolean }) => {
    const createWorkflow = useCreateWorkflow();
    const router = useRouter();

    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`);
            },
            onError: (error) => {
                toast.error(error.message || "Error Happened while creating workflow")
            },
        });
    };

    return (
        <>
            <EntityHeader
                title='Workflows'
                discription='Automate tasks and integrations'
                newButtonLable='Create Workflows'
                onNewFunction={handleCreate}
                disabled={disabled}
                isCreating={createWorkflow.isPending}
            />
        </>
    );
}

export const WorkflowSearch = () => {
    const [params, setParams] = useWorkflowParams();
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams
    });

    return (
        <EntitySerach
            value={searchValue}
            onChange={onSearchChange}
            placeHolder='Search Workflows'
        />
    )
}

export const WorkflowPagination = () => {
    const workflows = useSuspenseWorkflows();
    const [params, setParams] = useWorkflowParams()

    return (
        <EntityPagination
            page={workflows.data.page}
            totalPage={workflows.data.totalPages}
            onPageChange={(page) => setParams({ ...params, page })}
            disabled={workflows.isFetching}
        />
    );
};

export const WorkflowContainer = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <EntityContainer
            header={<WorkflowHeader />}
            search={<WorkflowSearch />}
            pagination={<WorkflowPagination />}
        >
            {children}
        </EntityContainer>
    );
};

export const WorkflowLoading = () => {
    return <LoadingView message='Loading Workflows' />;
};

export const WorkflowError = () => {
    return <ErrorView message='Error loading Workflows' />;
};

export const WorkflowEmpty = () => {
    const createWorkflow = useCreateWorkflow();
    const router = useRouter();

    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`);
            },
            onError: (error) => {
                toast.error(error.message || "Error Happened while creating workflow")
            }
        })
    }

    return (
        <>
            <EmptyView
                onNew={handleCreate}
                message="Looks like there are no workflows here right now"
            />
        </>
    );
};


export const StackedNodeIcons = ({
    nodes,
}: {
    nodes: { type: NodeType }[]
}) => {
    const preview = nodes.slice(0, 3)

    return (
        <div className="relative h-6 w-12 flex items-center">
            {preview.map((node, index) => {
                const isInitial = node.type === "INITIAL"
                if (isInitial) {
                    return (
                        <div key={node.type} className="size-8 flex items-center justify-center">
                            <WorkflowIcon className="size-5 text-muted-foreground" />
                        </div>
                    )
                }

                return (
                    <div
                        key={`${node.type}-${index}`}
                        className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-background ring-2 ring-background shadow-sm"
                        style={{
                            left: index * 13,
                            top: index * 2,
                            zIndex: 10 - index,
                        }}
                    >
                        <NodeIcon type={node.type} />
                    </div>
                )
            })}
        </div>
    )
}

