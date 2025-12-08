import { cn } from "@/lib/utils/style"

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4">
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-1 h-3 w-1/3" />
      </div>
    </div>
  )
}

export function StorageCardSkeleton() {
  return (
    <div className="border-border rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div>
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="mb-1 h-4 w-12" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="mt-3 h-2 w-full rounded-full" />
    </div>
  )
}
