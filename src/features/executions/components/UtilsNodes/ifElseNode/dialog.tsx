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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

export const ifFormSchema = z.object({
    variableName: z
        .string()
        .min(1, "Variable name is required")
        .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Invalid variable name"),

    condition: z.string().min(1, "Condition is required"),
});

export type IfElseFormValues = z.infer<typeof ifFormSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: IfElseFormValues) => void;
    defaultValues?: Partial<IfElseFormValues>;
}

export const IfElseDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {

    const form = useForm<IfElseFormValues>({
        resolver: zodResolver(ifFormSchema),
        defaultValues: {
            variableName: defaultValues?.variableName || "if1",
            condition: defaultValues?.condition || "",
        },
    });

    const watchVariableName = form.watch("variableName") || "if1";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>IF Condition</DialogTitle>
                    <DialogDescription>
                        Evaluate a condition and branch execution
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
                        {/* Variable Name */}
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="if1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Condition */}
                        <FormField
                            control={form.control}
                            name="condition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Condition</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="{{ai.text}} === 'approved'"
                                            className="font-mono text-sm min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Helper Card */}
                        <div className="rounded-lg bg-muted p-4 space-y-3 text-sm">
                            <h4 className="font-medium">How this works</h4>


                            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                                <li>
                                    The condition is evaluated as a <b>JavaScript boolean expression</b>.
                                </li>
                                <li>
                                    You can use variables from connected nodes directly.
                                </li>
                                <li>
                                    The IF node outputs a boolean result under the variable name.
                                </li>
                                <li>
                                    Connect the <b>true</b> or <b>false</b> outputs to control execution flow.
                                </li>
                                <li>
                                    <span className="text-green-600 font-medium">Green</span> output runs when the condition is true,
                                    <span className="text-red-600 font-medium"> red</span> when false.
                                </li>
                            </ul>

                            <div className="space-y-2">
                                <p className="font-medium">Examples</p>

                                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                                    <code className="bg-background px-2 py-1 rounded text-xs">
                                        {"{{ai.text}} === 'approved'"}
                                    </code>
                                    <span>Check AI output</span>

                                    <code className="bg-background px-2 py-1 rounded text-xs">
                                        {"{{http.status}} === 200"}
                                    </code>
                                    <span>Check HTTP status</span>

                                    <code className="bg-background px-2 py-1 rounded text-xs">
                                        {"{{googleForm.email}} != null"}
                                    </code>
                                    <span>Check form field exists</span>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Available Variables:
                                <code className="ml-2 bg-background px-2 py-1 rounded">
                                    {`{{ ${watchVariableName}.result }}`}
                                </code>
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose>Cancel</DialogClose>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
