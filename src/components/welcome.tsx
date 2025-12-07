import { auth } from "@/lib/auth/session"
import Logo from "./logo"

const Welcome = async () => {
  const session = await auth()

  return (
    <>
      <Logo className="size-10 p-3 text-center" />
      {session ? (
        <p className="mt-4 text-center">Welcome back, {session.email}!</p>
      ) : (
        <p>Welcome, please log in to continue.</p>
      )}
    </>
  )
}

export default Welcome
