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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

export const codeFormSchema = z.object({
    code: z.string().min(1, "Code is required"),
});

export type CodeFormValues = z.infer<typeof codeFormSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CodeFormValues) => void;
    defaultValues?: Partial<CodeFormValues>;
}

export const CodeDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {
    const form = useForm<CodeFormValues>({
        resolver: zodResolver(codeFormSchema),
        defaultValues: {
            code:
                defaultValues?.code ??
                `// 1. Access data from previous nodes
// const input = context.trigger.data;

// 2. Perform your logic
const result = "Hello World";

// 3. Return the output for the next node
return {
  message: result,
  timestamp: new Date().toISOString()
};`,
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Run Custom Code</DialogTitle>
                    <DialogDescription>
                        Execute custom JavaScript to transform data or perform logic.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((v) => {
                            onSubmit(v);
                            onOpenChange(false);
                        })}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 justify-between">
                                        <span>JavaScript Code</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Use <code className="bg-muted px-1 rounded">context</code> to access data
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="border rounded-md overflow-hidden h-[400px] w-full bg-[#1e1e1e]">
                                            <Editor
                                                height="100%"
                                                defaultLanguage="javascript"
                                                theme="vs-dark"
                                                value={field.value}
                                                onChange={(value) => field.onChange(value || "")}
                                                loading={
                                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground gap-2">
                                                        <Loader2 className="animate-spin h-5 w-5" />
                                                        Loading Editor...
                                                    </div>
                                                }
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    lineNumbers: "on",
                                                    scrollBeyondLastLine: false,
                                                    automaticLayout: true,
                                                    padding: { top: 16 },
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Updated Helper Section: Flex Row */}
                        <div className="flex flex-row items-center justify-between rounded-lg bg-muted p-3">
                            <div className="text-xs text-muted-foreground">
                                Available Variables:
                                <code className="bg-background px-2 py-1 rounded font-mono text-primary">
                                    {`{{ code.result }}`}
                                </code>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Return data to use retured object/string
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};