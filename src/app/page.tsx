import { Button } from "@/components/ui/button"
import Link from "next/link"


const Page = async () => {

  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-4">
      Landing page
      <Button>
        <Link href={"/login"}>
          Login
        </Link>
      </Button>
    </div>
  )
}

export default Page
