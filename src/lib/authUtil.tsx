import { headers } from "next/headers"
import { auth } from "./auth"
import { redirect } from "next/navigation"


const RequiredAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/login")
    }

    return session;
}

const NotRequiredAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (session) {
        redirect("/")
    }
}

export {NotRequiredAuth , RequiredAuth}