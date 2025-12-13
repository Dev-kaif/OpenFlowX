import SignUpForm from '@/features/auth/components/signupForm'
import { NotRequiredAuth } from '@/lib/authUtil'
import React from 'react'

async function page() {
  
  await NotRequiredAuth()

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <SignUpForm />
    </div>
  )
}

export default page
