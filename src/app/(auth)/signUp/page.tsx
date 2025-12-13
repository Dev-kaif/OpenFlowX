import SignUpForm from '@/features/auth/components/signupForm'
import { NotRequiredAuth } from '@/lib/authUtil'

async function page() {
  
  await NotRequiredAuth()

  return <SignUpForm />
}

export default page
