"use client"
import React from 'react'
import { useCreateWorkflow, useSuspenseWorkflows } from '@/features/workflows/hooks/useWorkflows';
import { EntityContainer, EntityHeader, EntityPagination, EntitySerach } from '@/components/entity/entityComponents';
import { useRouter } from 'next/navigation';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useWorkflowParams } from '../hooks/useWorkflowParams';
import { useEntitySearch } from '@/hooks/useEntitySearch';

export const WorkflowList = () => {
    const workflows = useSuspenseWorkflows()
  return (
    <div className=" px-10 flex flex-1 whitespace-pre-wrap">
        {JSON.stringify(workflows.data, null, 2)}
    </div>
  )
}

export const WorkflowHeader = ({ disabled }: { disabled?: boolean }) => {
    const createWorkflow = useCreateWorkflow();
    const router = useRouter();
    const { modal, handleError } = useUpgradeModal();

    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`); 
            },
            onError: (error) => {
                handleError(error)
            },
        });
    };

    return (
        <>
            {modal}
            <EntityHeader
                title='Workflows'
                discription='Create and Manage Workflows'
                newButtonLable='New Workflows'
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
            totalPage={workflows.data.totalCount}
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
            search={<WorkflowSearch/>}
            pagination={<WorkflowPagination/>}
        >
            {children}
        </EntityContainer>
    )
}
