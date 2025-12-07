# Yopem Pics

A comprehensive image editing application built with Next.js, featuring powerful
editing tools, AI-powered background removal, and social media template
generation.

## Features

### Image Editing Tools

- **Canvas Editor**: Interactive canvas with Fabric.js for precise image
  manipulation
- **Filters**: Apply brightness, contrast, saturation, blur, sharpen, and hue
  adjustments
- **Crop Tool**: Interactive cropping with preset aspect ratios and social media
  dimensions
- **Background Removal**: AI-powered background removal using
  @imgly/background-removal-node
- **Text Tool**: Add and customize text overlays
- **History**: Full undo/redo support with 50-state history

### Advanced Features

- **Social Media Templates**: Pre-configured templates for Instagram, Twitter/X,
  Facebook, and LinkedIn
- **Favicon Generator**: Generate complete favicon packages with all required
  sizes (ICO, PNG, WebP)
- **Project Management**: Save, load, and manage multiple projects
- **Export Options**: Export to PNG, JPEG, or WebP with quality control
- **Real-time Collaboration**: Autosave functionality with version control

### UI/UX

- **Modern Interface**: Clean, Cal.com-inspired design using coss UI components
- **Keyboard Shortcuts**: Efficient workflow with comprehensive keyboard support
- **Mobile Warning**: Optimized for desktop use with mobile device detection
- **Dark Mode**: Full dark mode support throughout the application
- **Responsive Design**: Adaptive layout for different screen sizes

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: Base UI with coss design system
- **Styling**: Tailwind CSS v4
- **Canvas**: Fabric.js for canvas manipulation
- **Backend**: tRPC for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Cloudflare R2 for image storage
- **Authentication**: OpenAuth
- **Image Processing**: Sharp (server-side), @imgly/background-removal-node (AI)

## Prerequisites

- Node.js 18+ or Bun runtime
- PostgreSQL database
- Cloudflare R2 bucket (for production)
- OpenAuth credentials

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."

# OpenAuth
OPENAUTH_CLIENT_ID="..."
OPENAUTH_CLIENT_SECRET="..."

# Feature Flags
ENABLE_IMAGE_EDITOR=true

# Cron Secret (for cleanup jobs)
CRON_SECRET="your-secret-key"
```

## Installation

```bash
# Install dependencies
bun install

# Run database migrations
bun run db:push

# Start development server
bun run dev
```

## Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run check` - Run all quality checks (lint, typecheck, format)
- `bun run lint` - Run ESLint
- `bun run typecheck` - Run TypeScript type checking
- `bun run format:check` - Check code formatting
- `bun run format:write` - Format code with Prettier
- `bun run db:push` - Apply database migrations
- `bun run db:studio` - Open Drizzle Studio to view database

## Editor Usage

### Getting Started

1. Navigate to `/editor` to create a new project
2. Upload an image or start with a blank canvas
3. Use the toolbar to select editing tools
4. Apply filters, crop, remove backgrounds, or add text
5. Save your project or export to various formats

### Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` - Redo
- `Ctrl/Cmd + S` - Save project
- `Tab` - Toggle sidebars
- `?` - Show keyboard shortcuts help

### Projects Dashboard

Access your projects at `/editor/projects`:

- View all saved projects
- Search and filter projects
- Open, rename, or delete projects
- Monitor storage usage

## Architecture

### Storage Structure

**Temporary Storage** (Server filesystem):

```
/tmp/yopem-pics/[sessionId]/[imageId]-[timestamp].png
```

- Auto-cleanup after 24 hours
- Used during active editing session

**Permanent Storage** (R2):

```
/pics/[userId]/[projectId]/original.[ext]
/pics/[userId]/[projectId]/edited-[version].[ext]
/pics/[userId]/[projectId]/exports/[exportId].[ext]
```

### Rate Limits

- **Background Removal**: 5 requests per minute per user
- **Export**: 20 requests per minute per user
- **Project Save**: 60 requests per minute per user

### Cron Jobs

A cleanup job runs every 6 hours (configured in `vercel.json`):

- Path: `/api/cron/cleanup`
- Removes temporary files older than 24 hours
- Requires `CRON_SECRET` authorization header

## Development Guidelines

### Code Style

- Use TypeScript strictly
- Prefer functional components with hooks
- Use tRPC for type-safe APIs
- Follow Prettier configuration (@yopem/prettier-config/react)
- No `console.log` (use `console.error`, `console.warn`, `console.info`)

### Error Handling

- Wrap server operations in try-catch
- Use `TRPCError` for API errors
- Implement user-friendly error messages
- Log errors with context using `console.error`

### Component Structure

```
src/components/
  editor/           # Editor-specific components
    canvas/         # Canvas and controls
    tools/          # Editing tools (crop, filters, etc.)
    panels/         # Sidebars and panels
    toolbar/        # Main toolbar
  ui/               # Reusable UI components (coss)
```

## Performance Considerations

- Canvas rendering optimized with object caching
- History limited to 50 states
- Auto-save debounced to 30 seconds
- Large images automatically downscaled before background removal (max 2048px)
- Lazy loading of Fabric.js library

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The `vercel.json` configuration includes:

- Cron job for temporary file cleanup (every 6 hours)
- Proper routing for Next.js App Router

### Environment-Specific Setup

**Production**:

- Ensure `ENABLE_IMAGE_EDITOR=true`
- Verify R2 bucket permissions and CORS settings
- Configure rate limiting if needed
- Set up monitoring for background removal processing times

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

AGPL-3.0-or-later

## Support

For issues, questions, or feedback, please open an issue on GitHub.
