import LoginForm from '@/features/auth/components/loginForm'
import { NotRequiredAuth } from '@/lib/authUtil'
import React from 'react'

async function page() {

  await NotRequiredAuth()
  
  return (
    <div className='flex justify-center items-center min-h-screen'>
      <LoginForm/>
    </div>
  )
}

export default page
