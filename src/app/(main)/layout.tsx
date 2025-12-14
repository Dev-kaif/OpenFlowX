import AppSidebar from '@/components/main/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react'

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset className='bg-accent/20'>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
