import { RequiredAuth } from '@/lib/authUtil';
import React from 'react'

interface PageProps{
  params: Promise<{
    credentialID:string
  }>
}

async function Page({ params }: PageProps) {
  await RequiredAuth()

  const { credentialID } = await params;
  return (
    <div>
      credentialID : {credentialID}
    </div>
  )
}

export default Page;