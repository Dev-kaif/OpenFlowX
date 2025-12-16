import React from 'react';
import { Button } from '../ui/button';
import { PlusIcon, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '../ui/input';

type EntityHeaderProps = {
    title: string,
    discription: string,
    newButtonLable: string,
    disabled?: boolean,
    isCreating?: boolean,
} & (
    | { onNewFunction: () => void; newButtonHref?: never }
    | { newButtonHref: string; onNewFunction?: never }
    | { onNewFunction?: never; newButtonHref?: never }
)


export const EntityHeader = ({
    title,
    discription,
    newButtonLable,
    onNewFunction,
    newButtonHref,
    disabled,
    isCreating,
}: EntityHeaderProps) => {
    return (
        <div className='flex flex-row items-center justify-between gap-x-4'>
            <div className='flex flex-col'>
            <h1 className='text-lg md:text-xl font-semibold'>{title}</h1>
            {discription && (
                <p className='text-xs md:text-sm text-muted-foreground'>{ discription}</p>
            )}
            </div>
            {onNewFunction && !newButtonHref && (
                <Button
                    disabled={isCreating || disabled}
                    size={"sm"}
                    onClick={onNewFunction}
                >
                    <PlusIcon />
                    {newButtonLable}
                </Button>
            )}
            {newButtonHref && !onNewFunction && (
                <Button
                    size={"sm"}
                    asChild
                >
                    <Link href={newButtonHref} prefetch>
                        {newButtonLable}
                    </Link>
                </Button>
            )}
        </div>
    )
}


type EntityContainerProps = {
    children: React.ReactNode,
    header?: React.ReactNode,
    search?: React.ReactNode,
    pagination?:React.ReactNode
}

export const EntityContainer = ({
    children,
    header,
    search,
    pagination
}:EntityContainerProps) => {
    return (
        <div className='p-4 md:px-10 md:py-6 h-full'>
            <div className='mx-auto max-w-7xl w-full flex flex-col gap-y-8 h-full'>
                {header}
                <div className='flex flex-col gap-y-4 h-full'>
                    {search}
                    {children}
                </div>
                {pagination}
            </div>
        </div>
    )
}

type EntitySearchProps = {
    value: string;
    onChange: (value: string) => void;
    placeHolder?: string;
};

export const EntitySerach = ({
    value,
    onChange,
    placeHolder = "Search"
}:EntitySearchProps) => {
    return (
        <div className='relative ml-auto'>
            <Search className='size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <Input className='max-w-[200px] bg-background shadow-none border-border pl-8'
                placeholder={placeHolder}
                value={value}
                onChange={(e)=>onChange(e.target.value)}
            />
        </div>
    );
}
