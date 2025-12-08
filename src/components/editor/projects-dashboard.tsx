"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  Clock,
  Copy,
  FileImage,
  HardDrive,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ProjectCardSkeleton,
  StorageCardSkeleton,
} from "@/components/ui/skeleton"
import { useTRPC } from "@/lib/trpc/client"
import { useToast } from "@/lib/utils/toast"

export function ProjectsDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const { showToast, showError } = useToast()
  const trpc = useTRPC()
  const projectsQuery = useQuery(trpc.projects.list.queryOptions())
  const storageQuery = useQuery(trpc.projects.getStorageQuota.queryOptions())
  const deleteMutation = useMutation(trpc.projects.delete.mutationOptions())
  const duplicateMutation = useMutation(
    trpc.projects.duplicate.mutationOptions(),
  )
  const updateMutation = useMutation(trpc.projects.update.mutationOptions())

  const projects = projectsQuery.data ?? []
  const storage = storageQuery.data
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const handleCreateNew = () => {
    router.push("/editor")
  }

  const handleOpenProject = (projectId: string) => {
    router.push(`/editor/${projectId}`)
  }

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId)
    setDeleteDialogOpen(true)
  }

  const handleDuplicateClick = async (projectId: string) => {
    try {
      const duplicated = await duplicateMutation.mutateAsync({ id: projectId })
      await projectsQuery.refetch()
      showToast("Project duplicated successfully", "success")
      router.push(`/editor/${duplicated.id}`)
    } catch (error) {
      showError(error, () => void handleDuplicateClick(projectId))
    }
  }

  const handleRenameClick = (projectId: string, currentName: string) => {
    setEditingProjectId(projectId)
    setEditingName(currentName)
  }

  const handleCancelRename = () => {
    setEditingProjectId(null)
    setEditingName("")
  }

  const handleSaveRename = async (projectId: string) => {
    if (!editingName.trim() || editingName === editingProjectId) {
      handleCancelRename()
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: projectId,
        name: editingName.trim(),
      })
      await projectsQuery.refetch()
      setEditingProjectId(null)
      setEditingName("")
      showToast("Project renamed successfully", "success")
    } catch (error) {
      showError(error, () => void handleSaveRename(projectId))
    }
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return

    try {
      await deleteMutation.mutateAsync({ id: projectToDelete })
      await projectsQuery.refetch()
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      showToast("Project deleted successfully", "success")
    } catch (error) {
      showError(error, () => void handleConfirmDelete())
    }
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your image editing projects
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </Button>
      </div>

      {storage && (
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Storage Usage</p>
                <p className="text-muted-foreground text-xs">
                  {formatBytes(storage.used)} of {formatBytes(storage.total)}{" "}
                  used
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {storage.percentage.toFixed(1)}%
              </p>
              <p className="text-muted-foreground text-xs">
                {storage.projectCount} projects, {storage.versionCount} versions
              </p>
            </div>
          </div>
          <div className="bg-secondary mt-3 h-2 w-full overflow-hidden rounded-full">
            <div
              className={`h-full transition-all ${
                storage.percentage > 90
                  ? "bg-destructive"
                  : storage.percentage > 75
                    ? "bg-yellow-500"
                    : "bg-primary"
              }`}
              style={{ width: `${Math.min(storage.percentage, 100)}%` }}
            />
          </div>
        </Card>
      )}

      {storageQuery.isLoading && <StorageCardSkeleton />}

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-input bg-background placeholder:text-muted-foreground focus:ring-primary h-10 w-full rounded-md border px-10 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        {projectsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileImage className="text-muted-foreground mb-4 h-16 w-16" />
            <h3 className="mb-2 text-lg font-semibold">No projects found</h3>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              {searchQuery
                ? "No projects match your search"
                : "Get started by creating your first project"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="group relative cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div
                  onClick={() => handleOpenProject(project.id)}
                  className="flex flex-col"
                >
                  <div className="bg-muted relative aspect-video w-full">
                    {project.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileImage className="text-muted-foreground h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {editingProjectId === project.id ? (
                      <div className="mb-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              void handleSaveRename(project.id)
                            } else if (e.key === "Escape") {
                              handleCancelRename()
                            }
                          }}
                          onBlur={() => void handleSaveRename(project.id)}
                          className="border-input bg-background focus:ring-primary w-full rounded border px-2 py-1 text-sm font-semibold focus:ring-2 focus:outline-none"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <h3 className="mb-1 truncate font-semibold">
                        {project.name}
                      </h3>
                    )}
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(project.updatedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    {project.metadata && (
                      <div className="text-muted-foreground mt-1 text-xs">
                        {project.metadata.width} × {project.metadata.height}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="bg-background/80 backdrop-blur-sm"
                        />
                      }
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRenameClick(project.id, project.name)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={(e) => {
                          e.stopPropagation()
                          void handleDuplicateClick(project.id)
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(project.id)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
