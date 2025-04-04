import { HydrateClient } from "@/trpc/server"

export default function Home() {
  return (
    <HydrateClient>
      <h1 className="text-4xl">Pics</h1>
    </HydrateClient>
  )
}
