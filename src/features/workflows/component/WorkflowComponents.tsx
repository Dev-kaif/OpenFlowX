"use client"
import React from 'react'
import { useCreateWorkflow, useSuspenseWorkflows } from '@/features/workflows/hooks/useWorkflows';
import {
    EmptyView,
    EntityContainer,
    EntityHeader,
    EntityList,
    EntityPagination,
    EntitySerach,
    ErrorView,
    LoadingView
} from '@/components/entity/entityComponents';
import { useRouter } from 'next/navigation';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useWorkflowParams } from '../hooks/useWorkflowParams';
import { useEntitySearch } from '@/hooks/useEntitySearch';

export const WorkflowList = () => {
    const workflows = useSuspenseWorkflows();
    return (
        <EntityList
            items={workflows.data.items}
            getKey={(workflow) => workflow.id}
            renderItem={(workflow) => <>{workflow.name}</>}
            emptyView={<WorkflowEmpty/>}
        />
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
    const { modal, handleError } = useUpgradeModal();
    const router = useRouter();

    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`); 
            },
            onError: (error) => {
                handleError(error);
            }
        })
    }

    return (
        <>
            {modal}
            <EmptyView
                onNew={handleCreate}
                message="Looks like there are no workflows here right now"
            />
        </>
    );
};