import Logout from "@/features/auth/Logout";
import { RequiredAuth } from "@/lib/authUtil";
import { caller } from "@/trpc/server";


const Page = async () => {

  await RequiredAuth();

  // const data = await caller.testAi()

  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-4">
      <div>
      {/* {JSON.stringify(data)} */}
      </div>
      <Logout />
    </div>
  )
}

export default Page
