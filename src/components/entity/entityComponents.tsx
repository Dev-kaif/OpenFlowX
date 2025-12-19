import React from 'react';
import { Button } from '../ui/button';
import { AlertTriangleIcon, Loader2Icon, MoreVerticalIcon, PackageOpenIcon, PlusIcon, Search, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { Input } from '../ui/input';
import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
    EmptyMedia,
} from "@/components/ui/empty";
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card';

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

type EntityPaginationProps = {
    page: number;
    totalPage: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

export const EntityPagination = ({
    page,
    totalPage,
    onPageChange,
    disabled,
}: EntityPaginationProps) => {
    return (
        <div className='flex items-center justify-between gap-x-2 w-full'>
            <div className='flex-1 text-muted-foreground text-sm'>
                Page {page} of {totalPage || 1}
            </div>
            <div className='flex items-center justify-end space-x-2 py-4'>
                <Button
                    disabled={disabled || page === 1}
                    variant={"outline"}
                    size={"sm"}
                    onClick={() => { onPageChange(Math.max(1, page - 1)) }}
                >
                    Previous
                </Button>
                <Button
                    disabled={disabled || page === totalPage || totalPage === 0}
                    variant={"outline"}
                    size={"sm"}
                    onClick={() => { onPageChange(Math.max(1, page + 1)) }}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

interface StateViewProps{
    message: string;
}


export const LoadingView = ({
    message
}: StateViewProps) => {
    return (
        <div className='flex justify-center items-center h-full flex-1 flex-col gap-y-4'>
            <Loader2Icon className='size-6 animate-spin text-primary' />
            {!!message &&
                <p className='text-sm text-muted-foreground'>
                    {message}...
                </p>
            }
        </div>
    );
    
};

export const ErrorView = ({
    message
}: StateViewProps) => {
    return (
        <div className='flex justify-center items-center h-full flex-1 flex-col gap-y-4'>
            <AlertTriangleIcon className='size-6 text-primary' />
            {!!message &&
                <p className='text-sm text-muted-foreground'>
                    {message}...
                </p>
            }
        </div>
    );
    
};

interface EmptyViewProps extends StateViewProps {
    onNew?: () => void;
}

export const EmptyView = ({
    message,
    onNew
}: EmptyViewProps) => {
    return (
        <Empty className='border border-dashed border-primary bg-white'>
            <EmptyHeader>
                <EmptyMedia variant={"icon"}>
                    <PackageOpenIcon className='text-primary' />
                </EmptyMedia>
            </EmptyHeader>
            <EmptyTitle>
                no items
            </EmptyTitle>
            {!!message && (
                <EmptyDescription>
                    {message}
                </EmptyDescription>
            )}
            {!!onNew && (
                <EmptyContent>
                    <Button onClick={onNew}>
                        Add items
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    );
};

interface EntityListProps<T>{
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    getKey?: (item: T, index: number) => string | number;
    emptyView?: React.ReactNode;
    className?: string;
}

export function EntityList<T>({
    items,
    renderItem,
    getKey,
    emptyView,
    className,
}: EntityListProps<T>) {
    
    if (items.length == 0 && emptyView) {
        return (
            <div className='flex flex-1 justify-center items-center'>
                <div className='mx-auto max-w-sm'>
                    {emptyView}
                </div>
            </div>
        );
    };

    return (
        <div className={cn("flex flex-col gap-y-4",className)}>
            {items.map((item, index) => (
                <div key={getKey ? getKey(item, index) : index}>
                    {renderItem(item, index)}
                </div>
            ))}
        </div>  
    );
};


interface EntityItemPros{
    href: string;
    title: string;
    subtitle?: React.ReactNode;
    image?: React.ReactNode;
    actions?: React.ReactNode;
    onRemove?: () => void | Promise<void>;
    isRemoving?: boolean;
    className?: string;
};

export const EntityItem = ({
    href,
    title,
    subtitle,
    image,
    actions,
    onRemove,
    isRemoving,
    className
}: EntityItemPros) => {
    
    const handelRemove = async (e:React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isRemoving) {
            return;
        }

        if (onRemove) {
            await onRemove()
        }
    }
    
    return(
        <Link href={href}>
            <Card className={cn("p-4 shadow-none hover:shadow cursor-pointer",
                isRemoving && "opacity-50 cursor-not-allowed",
                className
            )}>
                <CardContent className='flex flex-row items-center justify-between p-0'>
                    <div className='flex items-center gap-3'>
                        {image}
                        <div>
                            <CardTitle className='text-base font-medium'>
                                {title}
                            </CardTitle>
                            {!!subtitle &&
                                <CardDescription className='text-xs '>
                                    {subtitle}
                                </CardDescription>    
                            }
                        </div>
                    </div>
                    {(actions || onRemove) && (
                        <div className='flex gap-x-4 items-center'>
                            {actions}
                            {onRemove && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={(e) => e.stopPropagation()}
                                        >
                                        <MoreVerticalIcon className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        align="end"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <DropdownMenuItem onClick={handelRemove}>
                                            <TrashIcon className="size-4 text-red-500" />
                                            <span className='text-red-500 hover:text-red-600'>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}