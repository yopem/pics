import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/session"

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/login?returnUrl=/editor")
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {children}
    </div>
  )
}
