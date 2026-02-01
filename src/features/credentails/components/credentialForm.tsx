'use client';

import { useRouter } from "next/navigation";
import Image from 'next/image';
import { useCreateCredential, useSuspenseCredential, useUpdateCredential } from "../hooks/useCredentials";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
    Form,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
    FormField
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent
} from '@/components/ui/select';

import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from "next/link";
import { CredentialType } from "@/generated/prisma/enums";
import { useState } from "react";

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(CredentialType),
    value: z.string().min(1, 'API Key is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const credentialTypeOptions = [
    {
        value: CredentialType.OPENAI,
        label: "OpenAI",
        logo: "/openai.svg",
    },
    {
        value: CredentialType.OPENROUTER,
        label: "OpenRouter",
        logo: "/openrouter.svg",
    },
    {
        value: CredentialType.GEMINI,
        label: "Gemini",
        logo: "/gemini.svg",
    },
    {
        value: CredentialType.ANTHROPIC,
        label: "Anthropic",
        logo: "/anthropic.svg",
    },
    {
        value: CredentialType.DEEPSEEK,
        label: "DeepSeek",
        logo: "/deepseek.svg",
    },
    {
        value: CredentialType.XAI,
        label: "xAI",
        logo: "/grok.svg",
    },
    {
        value: CredentialType.POSTGRESS,
        label: "Postgres",
        logo: "/postgress.svg",
    },
    {
        value: CredentialType.GOOGLESHEETS,
        label: "Sheets",
        logo: "/googleform.svg",
    },
    {
        value: CredentialType.RESEND,
        label: "Resend",
        logo: "/resend.svg",
    },
];


interface CredentialFormProps {
    initialData?: {
        id?: string;
        name: string;
        type: CredentialType;
        value: string;
    };
};

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
    const router = useRouter();
    const createCredential = useCreateCredential();
    const updateCredential = useUpdateCredential();

    const isEdit = !!initialData?.id;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            type: CredentialType.GEMINI,
            value: '',
        },
    });

    const onSubmit = async (values: FormValues) => {
        if (isEdit && initialData?.id) {
            await updateCredential.mutateAsync({
                id: initialData.id,
                ...values,
            }, {
                onSuccess: () => {
                    router.push(`/credentials`);
                }
            });
        } else {
            await createCredential.mutateAsync(values, {
                onSuccess: () => {
                    router.push(`/credentials`);
                }
            })
        }
    };

    const selectedType = form.watch("type");

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>
                    {isEdit ? 'Edit Credential' : 'Create Credential'}
                </CardTitle>
                <CardDescription>
                    {isEdit
                        ? 'Update your API key or credential details'
                        : 'Add a new API key or credential to your account'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder={
                                            CredentialType.POSTGRESS === selectedType ?
                                                "My Connection String" : "My API Key"
                                        } {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {credentialTypeOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={option.logo}
                                                            alt={option.label}
                                                            width={16}
                                                            height={16}
                                                        />
                                                        {option.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {
                                            CredentialType.POSTGRESS === selectedType ?
                                                "Connection String" : "API Key"
                                        }
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder={
                                            CredentialType.POSTGRESS === selectedType ?
                                                "postgresql://" : "sk-..."
                                        }  {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={
                                    createCredential.isPending ||
                                    updateCredential.isPending
                                }
                            >
                                {isEdit ? 'Update' : 'Create'}
                            </Button>
                            <Button
                                type="button"
                                variant={'outline'}
                                asChild
                            >
                                <Link href='/credentials' prefetch>
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
};

export const CredentialView = ({ credentialId }: { credentialId: string }) => {

    const { data: credential } = useSuspenseCredential(credentialId);

    return <CredentialForm initialData={credential} />
};