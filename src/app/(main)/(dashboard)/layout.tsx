import AppHeader from '@/components/main/AppHeader';
import React from 'react'

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppHeader/>
      <main className='flex-1'>
          {children}
      </main>
    </>
  )
}

export default Layout
