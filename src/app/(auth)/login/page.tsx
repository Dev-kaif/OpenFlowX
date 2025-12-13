import LoginForm from '@/features/auth/components/loginForm'
import { NotRequiredAuth } from '@/lib/authUtil'

async function page() {

  await NotRequiredAuth()
  
  return <LoginForm/>
}

export default page;
