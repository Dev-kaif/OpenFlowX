"use client"
import React from 'react'
import { useCreateWorkflow, useSuspenseWorkflows } from '@/features/workflows/hooks/useWorkflows';
import { EntityContainer, EntityHeader } from '@/components/entity/entityComponents';
import { useRouter } from 'next/navigation';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

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

export const WorkflowContainer = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    return (
        <EntityContainer
            header={<WorkflowHeader />}
            search={<></>}
            pagination={<></>}
        >
            {children}
        </EntityContainer>
    )
}



