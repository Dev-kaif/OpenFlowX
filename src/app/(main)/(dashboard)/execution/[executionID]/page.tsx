import { RequiredAuth } from '@/lib/authUtil';
import React from 'react'

interface PageProps{
  params: Promise<{
    executionID:string
  }>
}

async function Page({ params }: PageProps) {
  await RequiredAuth()

  const { executionID } = await params;
  return (
    <div>
      executionID : {executionID}
    </div>
  )
}

export default Page;