import { redirect } from "next/navigation"

import { ProjectsDashboard } from "@/components/editor/projects-dashboard"
import { auth } from "@/lib/auth/session"

export default async function ProjectsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login?returnUrl=/editor/projects")
  }

  return <ProjectsDashboard />
}
