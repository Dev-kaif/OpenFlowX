"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { TableProperties, Info, Braces } from "lucide-react";
import { useCredentialsByType } from "@/features/credentails/hooks/useCredentials";
import { useEffect, useState } from "react";


function extractSpreadsheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
        throw new Error("Invalid Google Sheets URL");
    }
    return match[1];
}


export const sheetsSchema = z.object({
    credentialId: z.string().min(1, "Credential is required"),
    variableName: z.string().min(1, "Required"),
    action: z.enum(["append", "read"]),
    spreadsheetUrl: z.string().url("Invalid Google Sheets URL"),
    sheetName: z.string().min(1, "Sheet name is required"),
    range: z.string().optional(),
    values: z.string().optional(),
});

export type SheetsFormValues = z.infer<typeof sheetsSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: {
        credentialId: string;
        variableName: string;
        action: "append" | "read";
        spreadsheetId: string;
        range: string;
        values?: string;
    }) => void;
    defaultValues?: Partial<SheetsFormValues>;
}

export const GoogleSheetsDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {
    const {
        data: credentials,
        isLoading: isLoadingCredentials,
    } = useCredentialsByType("GOOGLESHEETS");

    const [showGuide, setShowGuide] = useState(false);

    const form = useForm<SheetsFormValues>({
        resolver: zodResolver(sheetsSchema),
        defaultValues: {
            credentialId: defaultValues?.credentialId ?? "",
            variableName: defaultValues?.variableName ?? "sheet_data",
            action: defaultValues?.action ?? "append",
            spreadsheetUrl: "",
            sheetName: defaultValues?.sheetName ?? "Sheet1",
            range: defaultValues?.range ?? "A:Z",
            values: defaultValues?.values ?? '["{{name}}", "{{email}}"]',
        },
    });

    const action = form.watch("action");
    const watchVariableName = form.watch("variableName");


    useEffect(() => {
        if (open) {
            setShowGuide(false);
        }
    }, [open]);

    useEffect(() => {
        if (!form.getValues("credentialId") && credentials?.length === 1) {
            form.setValue("credentialId", credentials[0].id);
        }
    }, [credentials, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TableProperties className="w-5 h-5 text-green-600" />
                        Google Sheets
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                    <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-2">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setShowGuide((v) => !v)}
                        >
                            <div className="flex items-center gap-2 font-medium">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                How to connect Google Sheets (Step-by-step)
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {showGuide ? "Hide" : "Show"}
                            </span>
                        </div>

                        {showGuide && (
                            <div className="space-y-2 text-xs text-muted-foreground">
                                <ol className="list-decimal ml-4 space-y-2">
                                    <li>
                                        Go to <b>console.cloud.google.com</b> → create a
                                        <b> New Project</b>
                                    </li>
                                    <li>
                                        Open <b>APIs & Services → Library</b> → enable
                                        <b> Google Sheets API</b>
                                    </li>
                                    <li>
                                        Go to <b>APIs & Services → Credentials</b> →
                                        <b> Create Credentials → Service Account</b>
                                    </li>
                                    <li>
                                        Open the service account → <b>Keys</b> tab →
                                        <b> Add Key → Create new key → JSON</b>
                                    </li>
                                    <li>
                                        Open your Google Sheet → <b>Share</b> → add the
                                        service account email
                                        <br />
                                        <span className="italic">
                                            (ends with <code>@iam.gserviceaccount.com</code>)
                                        </span>
                                        <br />
                                        Give <b>Editor</b> access
                                    </li>
                                    <li>
                                        Come back here → add a
                                        <b> Google Sheets credential</b> → paste the JSON key
                                    </li>
                                </ol>

                                <div className="rounded bg-background/60 p-2 text-[11px]">
                                    💡 You only need to do this once.
                                    The same credential can be reused for all Sheets.
                                </div>
                            </div>
                        )}
                    </div>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit((values) => {
                                const spreadsheetId = extractSpreadsheetId(
                                    values.spreadsheetUrl
                                );

                                const finalRange = `${values.sheetName}!${values.range || "A:Z"
                                    }`;

                                onSubmit({
                                    credentialId: values.credentialId,
                                    variableName: values.variableName,
                                    action: values.action,
                                    spreadsheetId,
                                    range: finalRange,
                                    values: values.values,
                                });

                                onOpenChange(false);
                            })}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="variableName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Output Variable Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="sheet_result" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="credentialId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Google Sheets Credential</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isLoadingCredentials}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            isLoadingCredentials
                                                                ? "Loading credentials..."
                                                                : "Select credential"
                                                        }
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentials?.map((cred) => (
                                                    <SelectItem key={cred.id} value={cred.id}>
                                                        {cred.name}
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
                                name="action"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Action</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="append">Append Row</SelectItem>
                                                <SelectItem value="read">Read Data</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            {action === "read" && watchVariableName && (
                                <div className="rounded-lg bg-muted p-3 text-xs space-y-2">
                                    <p className="font-medium">Available variables in next node</p>

                                    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
                                        <code className="bg-background px-1.5 py-0.5 rounded">
                                            {`{{${watchVariableName}.records}}`}
                                        </code>
                                        <span>List of row objects (header → value)</span>

                                        <code className="bg-background px-1.5 py-0.5 rounded">
                                            {`{{${watchVariableName}.records[0]}}`}
                                        </code>
                                        <span>First row object</span>

                                        <code className="bg-background px-1.5 py-0.5 rounded">
                                            {`{{${watchVariableName}.records[0].Email}}`}
                                        </code>
                                        <span>Cell value by column name</span>

                                        <code className="bg-background px-1.5 py-0.5 rounded">
                                            {`{{${watchVariableName}.count}}`}
                                        </code>
                                        <span>Number of data rows</span>

                                        <code className="bg-background px-1.5 py-0.5 rounded">
                                            {`{{${watchVariableName}.rows}}`}
                                        </code>
                                        <span>Raw sheet rows (including header)</span>
                                    </div>
                                </div>
                            )}

                            {action === "append" && (
                                <div className="rounded-lg bg-muted p-3 text-xs space-y-2">
                                    <p className="font-medium">Using AI to append rows</p>

                                    <div className="space-y-2 text-muted-foreground">
                                        <p>
                                            If you are using an AI node before this step, make sure the AI outputs
                                            <b> a valid JSON array</b> that matches your sheet columns.
                                        </p>

                                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                                            <code className="bg-background px-1.5 py-0.5 rounded">
                                                ["Name", "Email", "Status"]
                                            </code>
                                            <span>Required output format (example)</span>

                                            <code className="bg-background px-1.5 py-0.5 rounded">
                                                {`{{ai_output.text}}`}
                                            </code>
                                            <span>Use this directly in Row Values</span>
                                        </div>

                                        <div className="rounded bg-background/60 p-2 text-[11px] space-y-1">
                                            <p className="font-medium">Recommended AI system prompt</p>
                                            <code className="block whitespace-pre-wrap">
                                                {`You are a data formatting engine.
Return ONLY valid JSON.
No text, no explanation, no markdown.

Output must be a JSON array.
Example:
["Raven", "raven@example.com", "Active"]`}
                                            </code>
                                        </div>

                                        <p className="text-[11px]">
                                            💡 Tip: Always validate AI output once with hardcoded values before
                                            switching to AI-generated data.
                                        </p>
                                    </div>
                                </div>
                            )}



                            <FormField
                                control={form.control}
                                name="spreadsheetUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Google Sheets URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sheetName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sheet Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Sheet1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="range"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Column Range (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="A:Z" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {action === "append" && (
                                <FormField
                                    control={form.control}
                                    name="values"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Row Values (JSON Array)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="font-mono text-xs"
                                                    placeholder='["{{name}}", "{{email}}"]'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoadingCredentials}
                                >
                                    Save Node
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};
