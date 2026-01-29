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
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useCredentialsByType } from "@/features/credentails/hooks/useCredentials";
import { CredentialType } from "@/generated/prisma/enums";

export const AVAILABLE_MODELS = [
    "openai/gpt-4o-mini",
    "openai/gpt-4o",
    "openai/gpt-5",
    "openai/o3",
    "openai/o4-mini",

    "anthropic/claude-3.5-haiku",
    "anthropic/claude-3.7-sonnet",
    "anthropic/claude-opus-4.1",

    "deepseek/deepseek-r1",
    "deepseek/deepseek-v3.2",
    "deepseek/deepseek-chat-v3.1",

    "qwen/qwen-2.5-72b-instruct",
    "qwen/qwen-max",
    "qwen/qwen-plus",
    "qwen/qwen3-max"
] as const;

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

    systemPrompt: z.string().optional(),

    userPrompt: z.string().min(1, "User prompt is required"),
});

export type OpenRouterFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: OpenRouterFormValues) => void;
    defaultValues?: Partial<OpenRouterFormValues>;
}

export const OpenRouterDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {

    const CUSTOM_MODEL_VALUE = "__custom__";
    const [isCustomModel, setIsCustomModel] = useState(false);
    const { data: credentials, isLoading: isLoadingCredentials } = useCredentialsByType(CredentialType.OPENROUTER)


    const form = useForm<OpenRouterFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "myOpenRouter",
            model: defaultValues.model || AVAILABLE_MODELS[0],
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || "",
            credentialId: defaultValues.credentialId || ""
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "myOpenRouter",
                model: defaultValues.model || AVAILABLE_MODELS[0],
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || "",
                credentialId: defaultValues.credentialId || ""
            });
        }
    }, [open, form, defaultValues]);

    const watchVariableName = form.watch("variableName") || "myOpenRouter";

    const handleSubmit = (values: OpenRouterFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>OpenRouter AI</DialogTitle>
                    <DialogDescription>
                        Generate text using any model via OpenRouter (OpenAI, Claude, Gemini, Llama, etc.)
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-5 mt-4"
                    >
                        {/* Variable Name */}
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="myOpenRouter" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use this in next nodes like:{" "}
                                        <code className="font-mono">
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
                                    <FormLabel>Model</FormLabel>

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
                                                    <PlusIcon /> Custom model…
                                                </SelectItem>
                                                {AVAILABLE_MODELS.map((model) => (
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
                                                    placeholder="e.g. qwen/qwen-2.5-72b-instruct"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>

                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        setIsCustomModel(false);
                                                        field.onChange(AVAILABLE_MODELS[0]);
                                                    }}
                                                >
                                                    Back to list
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <FormDescription>
                                        Choose a preset OpenRouter model or enter any custom model ID.
                                    </FormDescription>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        {/* Credentials */}
                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>OpenRouter API key</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isLoadingCredentials || !credentials?.length}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={credentials?.length ? "Select API key" : "No API keys saved in Credentials"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {credentials?.map((cred) => (
                                                <SelectItem
                                                    key={cred.id}
                                                    value={cred.id}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={"/openrouter.svg"}
                                                            alt={"Open Router"}
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

                        {/* System Prompt */}
                        <FormField
                            control={form.control}
                            name="systemPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>System Prompt (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="You are a helpful assistant..."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Instructions that control the assistant behavior.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* User Prompt */}
                        <FormField
                            control={form.control}
                            name="userPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Summarize the following text: {{input.text}}"
                                            className="min-h-[120px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        <div className="rounded-lg bg-muted p-3 space-y-3 text-xs">
                                            <h4 className="font-medium text-sm">Using Variables</h4>

                                            <div className="space-y-2 text-muted-foreground">
                                                <p>You can reference data from AI nodes using these formats:</p>

                                                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                                                    <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                                        {`{{${watchVariableName}.text}}`}
                                                    </code>
                                                    <span>Access a text field</span>

                                                    <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                                        {`{{json ${watchVariableName}.raw}}`}
                                                    </code>
                                                    <span>Inject full object as JSON</span>
                                                </div>
                                            </div>
                                        </div>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-4">
                            <DialogClose className="mr-2">Cancel</DialogClose>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
