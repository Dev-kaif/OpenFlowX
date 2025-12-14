import { RequiredAuth } from '@/lib/authUtil'
import React from 'react'

async function page() {
  await RequiredAuth()

  return (
    <div>
      work
    </div>
  )
}

export default page
