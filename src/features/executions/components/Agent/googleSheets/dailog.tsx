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
import { Info, TableProperties } from "lucide-react";

import { useCredentialsByType } from "@/features/credentails/hooks/useCredentials";
import { CredentialType } from "@/generated/prisma/enums";
import { useEffect, useState } from "react";


function extractSpreadsheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

    if (!match) {
        throw new Error("Invalid Google Sheets URL");
    }

    return match[1];
}


export const sheetsToolSchema = z.object({
    credentialId: z.string().min(1, "Credential is required"),
    spreadsheetUrl: z.string().url("Invalid Google Sheets URL"),
    sheetName: z.string().min(1, "Sheet name is required"),
    range: z.string().optional(),
    values: z.string().optional(),
});

export type SheetsToolFormValues = z.infer<typeof sheetsToolSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: {
        credentialId: string;
        spreadsheetId: string;
        range: string;
        values?: string;
    }) => void;
    defaultValues?: Partial<SheetsToolFormValues>;
}


export const GoogleSheetsToolDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {

    const { data: credentials, isLoading } =
        useCredentialsByType(CredentialType.GOOGLESHEETS);

    const form = useForm<SheetsToolFormValues>({
        resolver: zodResolver(sheetsToolSchema),
        defaultValues: {
            credentialId: defaultValues?.credentialId ?? "",
            spreadsheetUrl: defaultValues?.spreadsheetUrl ?? "",
            sheetName: defaultValues?.sheetName ?? "Sheet1",
            range: defaultValues?.range ?? "A:Z",
            values: defaultValues?.values ?? "",
        },
    });

    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        if (open) {
            setShowGuide(false);
        }
    }, [open]);


    useEffect(() => {
        if (!form.getValues("credentialId") && credentials?.length === 1) {
            form.setValue("credentialId", credentials[0].id);
        }
    }, [credentials]);


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col">

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TableProperties className="w-5 h-5 text-green-600" />
                        Google Sheets Tool
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

                                const spreadsheetId = extractSpreadsheetId(values.spreadsheetUrl);

                                const finalRange =
                                    `${values.sheetName}!${values.range || "A:Z"}`;

                                onSubmit({
                                    credentialId: values.credentialId,
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
                                name="credentialId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Google Sheets Credential</FormLabel>

                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isLoading || !credentials?.length}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            isLoading
                                                                ? "Loading credentials..."
                                                                : credentials?.length
                                                                    ? "Select credential"
                                                                    : "No credentials available"
                                                        }
                                                    />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                {credentials?.length ? (
                                                    credentials.map((cred) => (
                                                        <SelectItem key={cred.id} value={cred.id}>
                                                            {cred.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem disabled value="no-creds">
                                                        No credentials available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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


                            <FormField
                                control={form.control}
                                name="values"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Row Values (JSON Array)</FormLabel>

                                        <FormControl>
                                            <Input
                                                className="font-mono text-xs"
                                                placeholder='["John", "john@email.com"]'
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <DialogFooter>
                                <Button type="submit" className="w-full">
                                    Save Tool
                                </Button>
                            </DialogFooter>

                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};