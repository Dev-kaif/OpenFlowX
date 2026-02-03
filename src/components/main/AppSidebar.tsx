"use client";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { FolderOpenIcon, HistoryIcon, KeyIcon, LogOutIcon, SettingsIcon, ChevronUpIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useGetSettings } from '@/features/settings/hooks/hooks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { useTheme } from 'next-themes';



function AppSidebar() {
    const router = useRouter();
    const pathName = usePathname();
    const { data } = useGetSettings();
    const { theme } = useTheme();

    const menuItems = [
        {
            title: "Home",
            items: [
                {
                    title: "WorkFlows",
                    icons: FolderOpenIcon,
                    url: "/workflows"
                },
                {
                    title: "Credentials",
                    icons: KeyIcon,
                    url: "/credentials"
                },
                {
                    title: "Execution",
                    icons: HistoryIcon,
                    url: "/executions"
                },
                {
                    title: "Settings",
                    icons: SettingsIcon,
                    url: "/settings"
                },
            ]
        }
    ];


    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenuItem>
                    <Link className='flex items-center w-full mt-1 mb-2' href={"/workflows"} prefetch>
                        <Image alt='OpenFlowX' className='w-fit h-10' width={100} height={100} src={theme === "dark" ? "/main/logo-dark.png" : "/main/logo.png"} />
                    </Link>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent>
                            <SidebarMenu >
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={item.url === "/" ? pathName === "/" : pathName.startsWith(item.url)}
                                            className='gap-x-4 h-10 px-4'
                                            asChild
                                        >
                                            <Link href={item.url} prefetch>
                                                <item.icons className='h-4 w-4' />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm hover:bg-accent transition">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                            {data?.image ? (
                                                <img
                                                    src={data?.image}
                                                    alt={data?.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-semibold text-primary">
                                                    {data?.name.slice(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="font-semibold text-sm capitalize truncate">
                                                {data?.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground truncate max-w-40">
                                                {data?.email}
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="start"
                                className="w-60 rounded-xl p-0 shadow-lg"
                            >
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                        {data?.image ? (
                                            <img
                                                src={data?.image}
                                                alt={data?.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-semibold text-primary">
                                                {data?.name?.slice(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm capitalize truncate">
                                            {data?.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate">
                                            {data?.email}
                                        </div>
                                    </div>
                                </div>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    className="gap-2 px-4 py-3 cursor-pointer"
                                    onClick={() => {
                                        authClient.signOut({
                                            fetchOptions: {
                                                onSuccess: () => {
                                                    router.push("/");
                                                },
                                            },
                                        });
                                    }}
                                >
                                    <LogOutIcon className="h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar
