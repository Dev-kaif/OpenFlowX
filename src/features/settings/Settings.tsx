"use client";

import { useState } from 'react';
import {
    User,
    KeyRound,
    Globe,
    Smartphone,
    Laptop,
    Link as LinkIcon,
    Unlink,
    ShieldCheck,
    Loader2,
    Monitor,
    Sun,
    Moon,
    Trash2,
    Plug
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Select, SelectValue, SelectTrigger, SelectItem, SelectContent } from '@/components/ui/select';
import { EntityContainer, EntityHeader, ErrorView, LoadingView } from '@/components/entity/entityComponents';
import { useDeleteTelegramConnection, useDisconnectTelegram, useGetSuspenseSettings, useGetTelegramLink, useGetTelegramStatus, useRevokeSession, useUnlinkAccount } from './hooks/hooks';
import { TelegramConnectDialog } from './TelegramConnectDialog';





export const SettingsContainer = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {

    return (
        <EntityContainer
            header={
                <EntityHeader
                    title="Account Settings"
                    discription="Manage your profile information and account security."
                />
            }
        >
            {children}
        </EntityContainer>
    )
}


const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};



export default function SettingsPage() {

    const { data: user } = useGetSuspenseSettings();
    const revokeSession = useRevokeSession();
    const unlinkAccount = useUnlinkAccount();
    const { data: telegramData, isLoading } = useGetTelegramLink();
    const { data: telegramStatus, isLoading: isTelegramLoading } = useGetTelegramStatus();
    const [telegramOpen, setTelegramOpen] = useState(false);


    const disconnectTelegram = useDisconnectTelegram();
    const deleteTelegram = useDeleteTelegramConnection();


    const { setTheme, theme } = useTheme();
    const [name, setName] = useState(user.name);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);


    const handleUpdateProfile = async () => {
        setIsUpdatingProfile(true);
        try {
            await authClient.updateUser({
                name: name,
            });
            toast.success("Profile updated");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };


    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPass, setIsChangingPass] = useState(false);

    const handleChangePassword = async () => {
        if (!newPassword || !currentPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsChangingPass(true);
        try {
            const { error } = await authClient.changePassword({
                currentPassword: currentPassword,
                newPassword: newPassword,
                revokeOtherSessions: true
            });

            if (error) {
                toast.error(error.message || "Failed to change password");
            } else {
                toast.success("Password updated successfully");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsChangingPass(false);
        }
    };

    const handleRevokeSession = (sessionId: string) => {
        revokeSession.mutate({ sessionId })
    }

    const handleUnlinkAccount = (providerName: string) => {
        unlinkAccount.mutate({ providerId: providerName })
    }

    const handleDisconnectTelegram = () => {
        disconnectTelegram.mutate();
    };

    const handleDeleteTelegram = () => {
        deleteTelegram.mutate();
    };


    const linkAccount = async (provider: "google" | "github") => {
        await authClient.signIn.social({
            provider: provider,
            callbackURL: "/settings"
        });
    };

    // Helper to check if a provider is connected
    const isConnected = (provider: string) =>
        user.accounts.some(acc => acc.providerId === provider);

    return (
        <>
            <TelegramConnectDialog
                open={telegramOpen}
                onOpenChange={setTelegramOpen}
                data={telegramData}
                isLoading={isLoading}
            />
            <div className="space-y-6 max-w-3xl mx-auto pb-10">

                {/* APPEARANCE */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="w-5 h-5" /> Appearance
                        </CardTitle>
                        <CardDescription>
                            Customize how the workspace looks on your device.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <Label>Interface Theme</Label>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Select your preferred theme for the dashboard.
                                </p>
                            </div>

                            {/* Mobile */}
                            <div className="sm:hidden w-35">
                                <Select
                                    value={theme}
                                    onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Theme" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="light">
                                            <div className="flex items-center gap-2">
                                                <Sun className="h-4 w-4" /> Light
                                            </div>
                                        </SelectItem>

                                        <SelectItem value="dark">
                                            <div className="flex items-center gap-2">
                                                <Moon className="h-4 w-4" /> Dark
                                            </div>
                                        </SelectItem>

                                        <SelectItem value="system">
                                            <div className="flex items-center gap-2">
                                                <Monitor className="h-4 w-4" /> System
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Destop */}
                            <div className="hidden sm:grid grid-cols-3 gap-1 p-1 bg-muted/50 rounded-lg border">
                                {/* Light */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTheme("light")}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-3 h-8 rounded-md transition-all",
                                        theme === "light"
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                                    )}
                                >
                                    <Sun className="w-4 h-4" />
                                    <span className="text-xs font-medium">Light</span>
                                </Button>

                                {/* Dark */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTheme("dark")}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-3 h-8 rounded-md transition-all",
                                        theme === "dark"
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                                    )}
                                >
                                    <Moon className="w-4 h-4" />
                                    <span className="text-xs font-medium">Dark</span>
                                </Button>

                                {/* System */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTheme("system")}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-3 h-8 rounded-md transition-all",
                                        theme === "system"
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                                    )}
                                >
                                    <Monitor className="w-4 h-4" />
                                    <span className="text-xs font-medium">System</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* PROFILE SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" /> Profile
                        </CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            {/* Avatar */}
                            <div className="shrink-0">
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name}
                                        className="w-20 h-20 rounded-full object-cover border"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border">
                                        <span className="text-xl font-semibold text-muted-foreground">
                                            {getInitials(user.name)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Profile fields */}
                            <div className="flex-1 space-y-4 w-full">
                                <div className="space-y-1">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={user.name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Email cannot be changed directly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/30 border-t py-3 flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleUpdateProfile}
                            disabled={isUpdatingProfile || name === user.name}
                        >
                            {isUpdatingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>

                {/* INTEGRATIONS */}
                <Card id="integrations">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plug className="w-5 h-5" /> Integrations
                        </CardTitle>
                        <CardDescription>
                            Connect external services used inside workflows and automations.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* TELEGRAM */}
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                    <img src="/telegram.svg" alt="Telegram" className="w-5 h-5" />
                                </div>

                                <div className="space-y-1">
                                    <p className="font-medium">Telegram</p>

                                    <p className="text-xs text-muted-foreground max-w-sm">
                                        Used by the <b>Telegram node</b> to send messages in your
                                        workflows. You must connect Telegram before using it.
                                    </p>

                                    <p className="text-xs">
                                        Status:{" "}
                                        <span
                                            className={cn(
                                                "font-medium",
                                                telegramStatus?.connected
                                                    ? "text-green-600"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {telegramStatus?.connected
                                                ? "Connected"
                                                : "Not connected"}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {telegramStatus?.connected ? (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDisconnectTelegram}
                                        disabled={disconnectTelegram.isPending}
                                    >
                                        {disconnectTelegram.isPending ? (
                                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                        ) : (
                                            <Unlink className="w-3.5 h-3.5 mr-2" />
                                        )}
                                        Disconnect
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDeleteTelegram}
                                        disabled={deleteTelegram.isPending}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => setTelegramOpen(true)}
                                    disabled={isTelegramLoading}
                                >
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Connect Telegram
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>


                {/* PASSWORD & SECURITY */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" /> Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Change Password</Label>
                                {!user.hasPassword && (
                                    <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
                                        Third-Party Account
                                    </span>
                                )}
                            </div>

                            {user.hasPassword ? (
                                // OPTION A: Show Form if they have a password
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="current">Current Password</Label>
                                        <Input
                                            id="current"
                                            type="password"
                                            placeholder="••••••••"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-start-1 space-y-2">
                                        <Label htmlFor="new">New Password</Label>
                                        <Input
                                            id="new"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm">Confirm New Password</Label>
                                        <Input
                                            id="confirm"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-end pt-2">
                                        <Button
                                            onClick={handleChangePassword}
                                            disabled={isChangingPass || !currentPassword || !newPassword}
                                        >
                                            {isChangingPass ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                                            Update Password
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed p-6 text-center bg-muted/30">
                                    <div className="flex justify-center mb-2">
                                        <ShieldCheck className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <h3 className="font-medium text-sm">No Password Set</h3>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                        You are logged in via a third-party provider (Google/GitHub). You don't need a password to log in.
                                    </p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <Label className="text-base">Active Sessions</Label>
                            <div className="rounded-md border divide-y">
                                {user.sessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${session.isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                {session.userAgent?.toLowerCase().includes('mobile') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {/* Simple Parser for User Agent */}
                                                    {session.userAgent?.split(')')[0] + ')' || "Unknown Device"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {session.ipAddress || "Unknown IP"} • {session.isCurrent ? "Current Session" : `Active since ${new Date(session.createdAt).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        </div>
                                        {session.isCurrent ? (
                                            <div className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                                                Active
                                            </div>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => handleRevokeSession(session.id)}
                                                disabled={revokeSession.isPending}
                                            >
                                                Revoke
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* PROVIDERS */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" /> Providers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Google */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                                    <img src="/Logos/google.svg" alt="Google" className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Google</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isConnected('google') ? "Connected" : "Not connected"}
                                    </p>
                                </div>
                            </div>
                            {isConnected('google') ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnlinkAccount('google')}
                                    disabled={unlinkAccount.isPending}
                                >
                                    <Unlink className="w-3.5 h-3.5 mr-2" /> Disconnect
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => linkAccount('google')}>
                                    <LinkIcon className="w-3.5 h-3.5 mr-2" /> Connect
                                </Button>
                            )}
                        </div>

                        {/* GitHub */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                </div>
                                <div>
                                    <p className="font-medium">GitHub</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isConnected('github') ? "Connected" : "Not connected"}
                                    </p>
                                </div>
                            </div>
                            {isConnected('github') ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnlinkAccount("github")}
                                    disabled={unlinkAccount.isPending}
                                >
                                    <Unlink className="w-3.5 h-3.5 mr-2" /> Disconnect
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => linkAccount('github')}>
                                    <LinkIcon className="w-3.5 h-3.5 mr-2" /> Connect
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>

    );
}


export const SettingsLoading = () => {
    return <LoadingView message='Loading settings...' />
};

export const SettingsError = () => {
    return <ErrorView message='Error loading settings...' />
};
