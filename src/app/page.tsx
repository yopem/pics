import Link from "next/link"
import {
  Download,
  Heart,
  ImageIcon,
  Layers,
  Paintbrush,
  Share2,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react"

import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-8" />
            <span className="text-lg font-semibold">Yopem Pics</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Features
            </Link>
            <Link
              href="/editor"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Editor
            </Link>
            <Link
              href="/editor/projects"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Projects
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button render={<Link href="/auth/login">Login</Link>} />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="border-border bg-muted inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                <Sparkles className="text-foreground size-4" />
                <span className="text-foreground">
                  Professional image editing in your browser
                </span>
              </div>

              <h1 className="text-foreground text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                The better way to edit images
              </h1>

              <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
                A fully customizable image editing platform for individuals and
                teams. Remove backgrounds, apply filters, create templates, and
                export in any format.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="min-w-[200px]"
                  render={<Link href="/editor" />}
                >
                  Start editing free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[200px]"
                  render={<Link href="/editor/projects" />}
                >
                  <Layers className="mr-2 size-4" />
                  View projects
                </Button>
              </div>

              <p className="text-muted-foreground text-sm">
                No credit card required
              </p>
            </div>

            <div className="mt-16">
              <div className="bg-muted/20 border-border relative mx-auto aspect-video max-w-5xl overflow-hidden rounded-2xl border shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-muted-foreground flex flex-col items-center gap-4">
                    <ImageIcon className="size-20" />
                    <p className="text-sm">Editor preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-border border-t py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Zap className="text-foreground size-5" />
                <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                  Features
                </span>
              </div>
              <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
                Everything you need to edit images
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                Powerful features and integrations to help you create stunning
                visuals effortlessly
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Wand2 className="text-foreground size-6" />}
                title="Background Removal"
                description="Remove image backgrounds with AI-powered precision. Perfect for product photos and portraits."
              />
              <FeatureCard
                icon={<Paintbrush className="text-foreground size-6" />}
                title="Filters & Effects"
                description="Apply professional filters like grayscale, sepia, blur, and more with real-time previews."
              />
              <FeatureCard
                icon={<Layers className="text-foreground size-6" />}
                title="Social Media Templates"
                description="Pre-built templates for Instagram, Facebook, Twitter, and LinkedIn with safe zones."
              />
              <FeatureCard
                icon={<ImageIcon className="text-foreground size-6" />}
                title="Background Replacement"
                description="Replace backgrounds with solid colors, gradients, or custom images seamlessly."
              />
              <FeatureCard
                icon={<Download className="text-foreground size-6" />}
                title="Export Anywhere"
                description="Export in PNG, JPEG, SVG, or WebP format with custom dimensions and quality."
              />
              <FeatureCard
                icon={<Share2 className="text-foreground size-6" />}
                title="Project Management"
                description="Save, organize, and collaborate on your projects with cloud storage integration."
              />
            </div>
          </div>
        </section>

        <section className="bg-muted/30 border-border border-y py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="text-foreground size-5" />
                  <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    How it works
                  </span>
                </div>
                <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
                  With us, editing is easy
                </h2>
                <p className="text-muted-foreground">
                  Effortless editing for everyone, powerful solutions for
                  professionals
                </p>
              </div>

              <div className="grid gap-12 md:grid-cols-3">
                <StepCard
                  number="01"
                  title="Upload your image"
                  description="Drag and drop or click to upload any image from your device."
                />
                <StepCard
                  number="02"
                  title="Edit with ease"
                  description="Use our intuitive tools to crop, filter, remove backgrounds, and more."
                />
                <StepCard
                  number="03"
                  title="Export & share"
                  description="Download in your preferred format or share directly to social media."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-foreground text-background rounded-3xl p-12 text-center shadow-2xl md:p-20">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to start editing?
              </h2>
              <p className="text-muted mb-8 text-lg">
                Join thousands of users creating beautiful images every day
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="min-w-[200px]"
                  render={<Link href="/editor" />}
                >
                  Get started free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-background text-background hover:bg-background/10 min-w-[200px]"
                  render={<Link href="/editor/projects" />}
                >
                  View examples
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="mb-4 inline-flex items-center gap-2">
                <Logo className="size-8" />
                <span className="text-lg font-semibold">Yopem Pics</span>
              </Link>
              <p className="text-muted-foreground mb-4 text-sm">
                Professional image editing made simple and accessible for
                everyone.
              </p>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Heart className="size-4" />
                <span>Made with love</span>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/editor"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Editor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/editor/projects"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-border mt-12 border-t pt-8">
            <p className="text-muted-foreground text-center text-sm">
              © {new Date().getFullYear()} Yopem Pics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-card border-border hover:border-foreground/20 group rounded-xl border p-6 transition-all hover:shadow-lg">
      <div className="bg-muted mb-4 inline-flex rounded-lg p-3">{icon}</div>
      <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="text-muted-foreground/20 mb-4 text-5xl font-bold">
        {number}
      </div>
      <h3 className="text-foreground mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
