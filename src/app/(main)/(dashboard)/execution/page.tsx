import { RequiredAuth } from '@/lib/authUtil'
import React from 'react'

async function page() {
  await RequiredAuth()

  return (
    <div>
      execu
    </div>
  )
}

export default page
