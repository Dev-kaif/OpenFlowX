"use client";

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
} from "@/components/ui/form";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

import { useCredentialsByType } from "@/features/credentails/hooks/useCredentials";
import { CredentialType } from "@/generated/prisma/enums";

export const scraperSchema = z.object({
    credentialId: z.string().optional(),
});

export type ScraperFormValues = z.infer<typeof scraperSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ScraperFormValues) => void;
    defaultValues?: Partial<ScraperFormValues>;
}

export const ScraperDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {

    const { data: credentials } =
        useCredentialsByType(CredentialType.SCRAPINGBEE);

    const form = useForm<ScraperFormValues>({
        resolver: zodResolver(scraperSchema),
        defaultValues: {
            credentialId: defaultValues?.credentialId ?? "system",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                credentialId: defaultValues?.credentialId ?? "system",
            });
        }
    }, [open, form, defaultValues]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Scraper Settings
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((values) => {
                            const payload = {
                                credentialId:
                                    values.credentialId === "system"
                                        ? ""
                                        : values.credentialId,
                            };

                            onSubmit(payload);
                            onOpenChange(false);
                        })}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Key className="w-4 h-4" />
                                        ScrapingBee API Key
                                    </FormLabel>

                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Use system default" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            <SelectItem value="system">
                                                Use system default
                                            </SelectItem>

                                            {credentials?.map((cred) => (
                                                <SelectItem key={cred.id} value={cred.id}>
                                                    {cred.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                            </DialogClose>

                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};