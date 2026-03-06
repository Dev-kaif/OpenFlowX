"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

import { z } from "zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlusIcon } from "lucide-react";

import { useCredentialsByType } from "@/features/credentails/hooks/useCredentials";
import { CredentialType } from "@/generated/prisma/enums";

export const AVAILABLE_AGENT_MODELS = [
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "openai/gpt-5",

    "anthropic/claude-3.7-sonnet",
    "anthropic/claude-opus-4.1",

    "deepseek/deepseek-v3.2",

    "qwen/qwen-max",
    "qwen/qwen-2.5-72b-instruct",
] as const;

const CUSTOM_MODEL_VALUE = "__custom__";

const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
            message:
                "Must start with a letter or underscore and contain only letters, numbers, underscores",
        }),

    model: z.string().min(1, { message: "Model is required" }),

    credentialId: z.string().min(1, { message: "API key is required" }),

    prompt: z.string().min(1, "Instructions/Prompt is required"),
});

export type AgentFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: AgentFormValues) => void;
    defaultValues?: Partial<AgentFormValues>;
}

export const AgentDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const { data: credentials, isLoading: isLoadingCredentials } =
        useCredentialsByType(CredentialType.OPENROUTER);

    const credentialsList = credentials ?? [];

    const [isCustomModel, setIsCustomModel] = useState(false);

    const form = useForm<AgentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName ?? "myAgent",
            model: defaultValues.model ?? AVAILABLE_AGENT_MODELS[0],
            prompt:
                defaultValues.prompt ??
                "Solve the following request using your available tools:\n\n{{input.query}}",
            credentialId: defaultValues.credentialId ?? "",
        },
    });

    useEffect(() => {
        if (open) {
            const model = defaultValues.model ?? AVAILABLE_AGENT_MODELS[0];

            setIsCustomModel(!AVAILABLE_AGENT_MODELS.includes(model as any));

            form.reset({
                variableName: defaultValues.variableName ?? "myAgent",
                model,
                prompt:
                    defaultValues.prompt ??
                    "Solve the following request using your available tools:\n\n{{input.query}}",
                credentialId: defaultValues.credentialId ?? "",
            });
        }
    }, [open, form, defaultValues]);

    const watchVariableName = form.watch("variableName") || "myAgent";

    const handleSubmit = (values: AgentFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Autonomous AI Agent
                    </DialogTitle>

                    <DialogDescription>
                        Give the agent instructions and connect tools visually. It will
                        decide when and how to use them.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-5 mt-4"
                    >
                        <div className="grid grid-cols-2 gap-4">

                            {/* Variable Name */}

                            <FormField
                                control={form.control}
                                name="variableName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Variable Name</FormLabel>

                                        <FormControl>
                                            <Input placeholder="myAgent" {...field} />
                                        </FormControl>

                                        <FormDescription className="text-[10px]">
                                            Output:
                                            <code className="font-mono ml-1">
                                                {`{{${watchVariableName}.text}}`}
                                            </code>
                                        </FormDescription>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Model */}

                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Agent Model</FormLabel>

                                        {!isCustomModel ? (
                                            <Select
                                                value={field.value}
                                                onValueChange={(v) => {
                                                    if (v === CUSTOM_MODEL_VALUE) {
                                                        setIsCustomModel(true);
                                                        field.onChange("");
                                                    } else {
                                                        field.onChange(v);
                                                    }
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select model" />
                                                    </SelectTrigger>
                                                </FormControl>

                                                <SelectContent>
                                                    <SelectItem value={CUSTOM_MODEL_VALUE}>
                                                        <PlusIcon className="mr-2 h-4 w-4" />
                                                        Custom model…
                                                    </SelectItem>

                                                    {AVAILABLE_AGENT_MODELS.map((model) => (
                                                        <SelectItem key={model} value={model}>
                                                            {model}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="space-y-2">
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. google/gemini-2.0-flash"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>

                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        setIsCustomModel(false);
                                                        field.onChange(AVAILABLE_AGENT_MODELS[0]);
                                                    }}
                                                >
                                                    Back to list
                                                </Button>
                                            </div>
                                        )}

                                        <FormDescription className="text-[10px]">
                                            Must support tool calling.
                                        </FormDescription>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Credentials */}

                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>OpenRouter API key</FormLabel>

                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={
                                            isLoadingCredentials || credentialsList.length === 0
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        credentialsList.length
                                                            ? "Select API key"
                                                            : "No API keys saved in Credentials"
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            {credentialsList.map((cred) => (
                                                <SelectItem key={cred.id} value={cred.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src="/openrouter.svg"
                                                            alt="OpenRouter"
                                                            width={16}
                                                            height={16}
                                                        />
                                                        {cred.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Prompt */}

                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Instructions (Prompt)</FormLabel>

                                    <FormControl>
                                        <Textarea
                                            placeholder="What would you like the agent to achieve?"
                                            className="min-h-40 font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormDescription>
                                        <div className="rounded-lg bg-muted p-3 space-y-3 text-xs">
                                            <h4 className="font-medium text-sm flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                Connecting Tools
                                            </h4>

                                            <div className="text-muted-foreground space-y-2">
                                                <p>
                                                    Drag outputs of other nodes into the purple{" "}
                                                    <b>TOOLS</b> handle to give this agent abilities.
                                                </p>

                                                <p>
                                                    Use Handlebars like{" "}
                                                    <code className="bg-background px-1 rounded">
                                                        {`{{webhook.payload.query}}`}
                                                    </code>{" "}
                                                    for dynamic input.
                                                </p>
                                            </div>
                                        </div>
                                    </FormDescription>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-6 pt-4 border-t">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="mr-2">
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Save Agent
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};