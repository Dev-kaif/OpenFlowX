import { RequiredAuth } from '@/lib/authUtil';
import React from 'react'

interface PageProps{
  params: Promise<{
    workflowID:string
  }>
}

async function Page({ params }: PageProps) {
  await RequiredAuth()

  const { workflowID } = await params;
  return (
    <div>
      workflow ID : {workflowID}
    </div>
  )
}

export default Page;