"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Edit2,
  FileImage,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { SelectProject } from "@/lib/db/schema"
import { useTRPC } from "@/lib/trpc/client"

export default function EditorPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [projectToRename, setProjectToRename] = useState<SelectProject | null>(
    null,
  )
  const [newProjectName, setNewProjectName] = useState("")

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: projects, isLoading } = useQuery(
    trpc.projects.list.queryOptions(),
  )
  const createProject = useMutation({
    ...trpc.projects.create.mutationOptions(),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: ["projects", "list"] })
      router.push(`/editor/${project.id}`)
    },
  })
  const deleteProject = useMutation({
    ...trpc.projects.delete.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", "list"] })
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    },
  })
  const updateProject = useMutation({
    ...trpc.projects.update.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", "list"] })
      setRenameDialogOpen(false)
      setProjectToRename(null)
      setNewProjectName("")
    },
  })

  const handleCreateNew = () => {
    createProject.mutate({
      name: `Untitled Project ${new Date().toLocaleDateString()}`,
      status: "draft",
    })
  }

  const handleOpenProject = (projectId: string) => {
    router.push(`/editor/${projectId}`)
  }

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId)
    setDeleteDialogOpen(true)
  }

  const handleRenameProject = (project: SelectProject) => {
    setProjectToRename(project)
    setNewProjectName(project.name)
    setRenameDialogOpen(true)
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject.mutate({ id: projectToDelete })
    }
  }

  const confirmRename = () => {
    if (projectToRename && newProjectName.trim()) {
      updateProject.mutate({
        id: projectToRename.id,
        name: newProjectName.trim(),
      })
    }
  }

  const filteredProjects = projects?.filter((project: SelectProject) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="bg-background flex h-full flex-col">
      <div className="bg-card border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground">
                Manage and organize your image projects
              </p>
            </div>
            <Button onClick={handleCreateNew} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Project
            </Button>
          </div>

          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background focus:ring-primary w-full rounded-lg border px-10 py-2 focus:ring-2 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto flex-1 overflow-auto px-6 py-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground">Loading projects...</div>
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project: SelectProject) => (
              <Card
                key={project.id}
                className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div
                  className="bg-muted relative aspect-video"
                  onClick={() => handleOpenProject(project.id)}
                >
                  {project.thumbnail ? (
                    <Image
                      src={project.thumbnail}
                      alt={project.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileImage className="text-muted-foreground h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3
                      className="flex-1 truncate font-semibold"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      {project.name}
                    </h3>
                    <Popover>
                      <PopoverTrigger>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleRenameProject(project)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Rename
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <span className="capitalize">{project.status}</span>
                    <span>
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {project.metadata && (
                    <div className="text-muted-foreground mt-2 text-xs">
                      {project.metadata.width} × {project.metadata.height}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center">
            <FileImage className="text-muted-foreground mb-4 h-16 w-16" />
            <h2 className="mb-2 text-xl font-semibold">No projects yet</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "No projects match your search"
                : "Create your first project to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-4">
            <p className="text-muted-foreground text-sm">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-4">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="bg-background focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
              placeholder="Enter project name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmRename()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRename}
              disabled={updateProject.isPending || !newProjectName.trim()}
            >
              {updateProject.isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
