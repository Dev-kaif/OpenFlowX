"use client";
import {   Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { CreditCardIcon, FolderOpenIcon, HistoryIcon, KeyIcon, LogOutIcon, StarIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useHasActiveSubscription } from '@/features/subscription/hooks/useSubscription';



function AppSidebar() {
    const router = useRouter();
    const pathName = usePathname();

    const { HasActiveSubscription, subscription, isLoading } = useHasActiveSubscription();

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
                    url: "/execution"
                },
            ]
        }
    ];


  return (
    <Sidebar>
        <SidebarHeader>
            <SidebarMenuItem>
                <SidebarMenuButton asChild className='gap-x-4 h-10 p-4'>
                    <Link href={"/workflows"} prefetch>
                        <Image alt='OpenFlowX' width={30} height={30} src={"/Logos/logo.svg"} />
                        <span className='text-sm font-semibold'>OpenFlowX</span>
                    </Link>
                </SidebarMenuButton>
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
                                        isActive={item.url==="/" ? pathName === "/":pathName.startsWith(item.url)}
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
                    
                    {!HasActiveSubscription && !isLoading  && 
                        <SidebarMenuButton
                            tooltip={"Upgrade to Pro"}
                            className='gap-x-4 h-10 px-4'
                            onClick={()=>authClient.checkout({slug:"proMax"})}
                        >
                            <StarIcon className='h-4 w-4'/>
                            <span>Upgrade to Pro</span>
                        </SidebarMenuButton>
                    }
                    
                    <SidebarMenuButton
                        tooltip={"Billing"}
                        className='gap-x-4 h-10 px-4'
                        onClick={()=>authClient.customer.portal()}
                    >
                        <CreditCardIcon className='h-4 w-4' />
                        <span>Billing</span>
                    </SidebarMenuButton>
                    <SidebarMenuButton
                        tooltip={"Sign Out"}
                        className='gap-x-4 h-10 px-4'
                        onClick={()=>{
                            authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        router.push("/")
                                    }
                                }
                            })
                        }}
                    >
                        <LogOutIcon className='h-4 w-4' />
                        <span>Sign Out</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
