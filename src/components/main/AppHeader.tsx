import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'

function AppHeader() {
  return (
    <header className='flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background'>
      <SidebarTrigger/>
    </header>
  )
}

export default AppHeader
