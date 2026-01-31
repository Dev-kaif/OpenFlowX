"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { z } from "zod";
import {
    Form,
    FormControl,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { Database, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useCredentialsByType } from "@/features/credentails/hooks/useCredentials";
import { CredentialType } from "@/generated/prisma/enums";
import { fetchPostgressTables } from "./actions";


const postgressSchema = z.object({
    credentialId: z.string().min(1, "Database credential is required"),
    action: z.enum(["INSERT", "SELECT", "UPDATE", "DELETE", "QUERY"]),
    tableName: z.string().optional(),
    data: z.string().optional(),
    filter: z.string().optional(),
    rawQuery: z.string().optional(),
});

export type PostgressFormValues = z.infer<typeof postgressSchema>;


interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: PostgressFormValues) => void;
    defaultValues?: Partial<PostgressFormValues>;
}


export const PostgressDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const [fetchedTables, setFetchedTables] = useState<string[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    const { data: credentials, isLoading } = useCredentialsByType(CredentialType.POSTGRESS);

    const form = useForm<PostgressFormValues>({
        resolver: zodResolver(postgressSchema),
        defaultValues: {
            credentialId: defaultValues.credentialId ?? "",
            action: defaultValues.action ?? "SELECT",
            tableName: defaultValues.tableName ?? "",
            data: defaultValues.data ?? '{\n  "email": "{{trigger.email}}"\n}',
            filter: defaultValues.filter ?? '{\n  "id": 1\n}',
            rawQuery: defaultValues.rawQuery ?? "SELECT * FROM users LIMIT 5;",
        },
    });

    const action = form.watch("action");
    const credentialId = form.watch("credentialId");

    useEffect(() => {
        if (!open) return;
        setFetchedTables([]);
    }, [open]);



    const selectedCredential = credentials?.find(
        (c) => c.id === credentialId
    );

    const handleFetchTables = async () => {
        if (!credentialId) {
            toast.error("Select a database credential first");
            return;
        }

        if (!selectedCredential) {
            toast.error("Select a database credential first");
            return;
        }

        setIsFetching(true);
        const result = await fetchPostgressTables(credentialId, selectedCredential?.userId);
        setIsFetching(false);

        if (!result.success) {
            toast.error(result.error || "Failed to fetch tables");
            return;
        }

        if (!result.tables?.length) {
            toast.warning("Connected, but no public tables found");
            return;
        }

        setFetchedTables(result.tables);
        toast.success(`Found ${result.tables.length} tables`);

        if (!form.getValues("tableName")) {
            form.setValue("tableName", result.tables[0]);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        Postgres Database
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((v) => {
                            onSubmit(v);
                            onOpenChange(false);
                        })}
                        className="space-y-4"
                    >

                        {/* Credential */}
                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Database Credential</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isLoading || !credentials?.length}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        credentials?.length
                                                            ? "Select Postgres credential"
                                                            : "No Postgres credentials saved"
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {credentials?.map((cred) => (
                                                <SelectItem
                                                    key={cred.id}
                                                    value={cred.id}
                                                >
                                                    {cred.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Action + Table */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="action"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Action</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="SELECT">Select</SelectItem>
                                                <SelectItem value="INSERT">Insert</SelectItem>
                                                <SelectItem value="UPDATE">Update</SelectItem>
                                                <SelectItem value="DELETE">Delete</SelectItem>
                                                <SelectItem value="QUERY">Raw SQL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            {action !== "QUERY" && (
                                <FormField
                                    control={form.control}
                                    name="tableName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex justify-between items-center">
                                                Table
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleFetchTables()}
                                                    disabled={isFetching || !credentialId}
                                                >
                                                    {isFetching ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </FormLabel>

                                            <FormControl>
                                                {fetchedTables.length ? (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select table" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fetchedTables.map((t) => (
                                                                <SelectItem key={t} value={t}>
                                                                    {t}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        placeholder="public.users"
                                                        {...field}
                                                    />
                                                )}
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Data */}
                        {(action === "INSERT" || action === "UPDATE") && (
                            <FormField
                                control={form.control}
                                name="data"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data (JSON)</FormLabel>
                                        <div className="border rounded-md h-[200px] overflow-hidden">
                                            <Editor
                                                height="100%"
                                                defaultLanguage="json"
                                                theme="vs-dark"
                                                value={field.value}
                                                onChange={(v) => field.onChange(v || "")}
                                                options={{ minimap: { enabled: false } }}
                                            />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Filter */}
                        {(action === "SELECT" ||
                            action === "UPDATE" ||
                            action === "DELETE") && (
                                <FormField
                                    control={form.control}
                                    name="filter"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Filter (JSON)</FormLabel>
                                            <div className="border rounded-md h-[150px] overflow-hidden">
                                                <Editor
                                                    height="100%"
                                                    defaultLanguage="json"
                                                    theme="vs-dark"
                                                    value={field.value}
                                                    onChange={(v) => field.onChange(v || "")}
                                                    options={{ minimap: { enabled: false } }}
                                                />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            )}

                        {/* Raw SQL */}
                        {action === "QUERY" && (
                            <FormField
                                control={form.control}
                                name="rawQuery"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SQL Query</FormLabel>
                                        <div className="border rounded-md h-[200px] overflow-hidden">
                                            <Editor
                                                height="100%"
                                                defaultLanguage="sql"
                                                theme="vs-dark"
                                                value={field.value}
                                                onChange={(v) => field.onChange(v || "")}
                                                options={{ minimap: { enabled: false } }}
                                            />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Database Node</Button>
                        </DialogFooter>

                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
