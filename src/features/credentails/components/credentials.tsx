"use client"
import React from 'react'
import { useRemoveCredential, useSuspenseCredentials } from '@/features/credentails/hooks/useCredentials';
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
import { useCredentialParams } from '../hooks/useCredentailParams';
import { useEntitySearch } from '@/hooks/useEntitySearch';
import type { Credential } from '@/generated/prisma/client';
import { formatDistanceToNow } from "date-fns";
import { credentialTypeOptions } from './credentialForm';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { getThemedIcon } from '@/lib/icon';


export const CredentialList = () => {
    const credentials = useSuspenseCredentials();
    return (
        <EntityList
            items={credentials.data.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) => <CredentialItem data={credential} />}
            emptyView={<CredentialEmpty />}
        />
    )
}


export const CredentialHeader = ({ disabled }: { disabled?: boolean }) => {

    return (
        <>
            <EntityHeader
                title='Credentials'
                discription='Create and Manage Credentials'
                newButtonLable='New Credentials'
                newButtonHref='/credentials/new'
                disabled={disabled}
            />
        </>
    );
}



export const CredentialSearch = () => {
    const [params, setParams] = useCredentialParams();
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams
    });

    return (
        <EntitySerach
            value={searchValue}
            onChange={onSearchChange}
            placeHolder='Search Credentials'
        />
    )
}



export const CredentialPagination = () => {
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialParams()

    return (
        <EntityPagination
            page={credentials.data.page}
            totalPage={credentials.data.totalPages}
            onPageChange={(page) => setParams({ ...params, page })}
            disabled={credentials.isFetching}
        />
    );
};



export const CredentialContainer = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <EntityContainer
            header={<CredentialHeader />}
            search={<CredentialSearch />}
            pagination={<CredentialPagination />}
        >
            {children}
        </EntityContainer>
    );
};


export const CredentialLoading = () => {
    return <LoadingView message='Loading Credentials' />;
};


export const CredentialError = () => {
    return <ErrorView message='Error loading Credentials' />;
};


export const CredentialEmpty = () => {
    const router = useRouter();

    const handleCreate = () => {
        router.push(`/credentials/new`)
    }

    return (
        <>
            <EmptyView
                onNew={handleCreate}
                message="Looks like there are no credentials here right now"
            />
        </>
    );
};


export const CredentialItem = ({ data }: { data: Credential }) => {
    const removeCredential = useRemoveCredential();
    const { theme } = useTheme();
    const currentTheme = theme === "dark" ? "dark" : "light"

    const handleRemove = () => {
        removeCredential.mutate({ id: data.id });
    };

    const option = credentialTypeOptions.find(
        (opt) => opt.value === data.type
    );

    return (
        <EntityItem
            href={`/credentials/${data.id}`}
            title={data.name}
            subtitle={`Updated ${formatDistanceToNow(data.updatedAt, { addSuffix: true })} • Created ${formatDistanceToNow(data.createdAt, { addSuffix: true })}`}
            image={
                <div className="size-8 flex items-center justify-center">
                    {option && (
                        <img
                            src={getThemedIcon(option.logo, currentTheme)}
                            alt={option.label}
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                                e.currentTarget.src = option.logo;
                            }}
                        />
                    )}
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeCredential.isPending}
        />
    );
};