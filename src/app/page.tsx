// Server Component 
// in server component we can directly import caller from trpc/server and call any procedure
/*
import { caller } from '@/trpc/server';

const Page = async () => {
  const string = await caller.hello()
  return (
    <div className='min-h-screen flex justify-center items-center'>
      {string.greeting}
    </div>
  )
}
export default Page;
*/


// client component
// Here we use useTRPC hook to get the trpc instance and useQuery from react-query to fetch data
"use client"
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query';

const Page = () => {

  const trpc = useTRPC();
  // we just did data = string
  // we are using tanstack query's useQuery hook to call the hello procedure in client component
  const {data : string} = useQuery(trpc.hello.queryOptions())

  return (
    <div className='min-h-screen flex justify-center items-center'>
      {string?.greeting}
    </div>
  )
}
export default Page;
