"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";


import {  Form,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormField
} from "@/components/ui/form";

import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import {Eye, EyeOff, Github } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type loginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() { 

    const router = useRouter();
    const [isPasswordHidden, setIsPasswordHidden] = useState(true)

    const form = useForm<loginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: loginFormValues) => {
        await authClient.signIn.email({
                email: values.email,
                password: values.password,
                callbackURL: "/",
            }, {
                onSuccess: () => {
                    router.push("/workflows")
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                }
            });
    }


    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Welcome Back to OpenFlowX</CardTitle>
                    <CardDescription>
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="flex flex-col gap-4">
                                    <Button
                                        variant="outline"
                                        className="w-full flex items-center gap-2 py-5 text-[15px]"
                                        type="button"
                                        disabled={isPending}
                                    >
                                        <Github className="w-5 h-5" />
                                        Continue with GitHub
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full flex items-center gap-2 py-5 text-[15px] bg-white hover:bg-neutral-100"
                                        type="button"
                                        disabled={isPending}
                                    >
                                        <FaGoogle className="w-5 h-5" />
                                        Continue with Google
                                    </Button>
                                </div>
                                <Separator/>
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="example@gmail.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={isPasswordHidden ? "password" : "text"}
                                                            placeholder="********"
                                                            {...field}
                                                            className="pr-10" 
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsPasswordHidden(!isPasswordHidden)}
                                                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                                                        >
                                                            {isPasswordHidden ? (
                                                                <EyeOff className="w-5 h-5" />
                                                            ) : (
                                                                <Eye className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        className="w-full"
                                        type="submit"
                                        disabled={isPending}
                                    >Log In</Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                    <CardFooter className="flex gap-2 justify-center items-center mt-2">
                            <div>
                                Don&apos;t have an account? 
                            </div>
                            <Link href={"/signUp"} className="underline underline-offset-4">
                                Sign Up
                            </Link>
                    </CardFooter>
                </CardContent>
            </Card>
        </div>
    )

};

