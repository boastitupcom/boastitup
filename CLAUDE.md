# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BOAST IT UP is a Next.js application built with Turborepo for social media content management, specifically focused on Instagram content organization, analytics, and growth tools. The application uses Supabase for authentication and backend services, Cloudinary for image management, and Zustand for state management.

## Development Commands

### Package Manager
- Uses `pnpm` (v9.0.0) for package management
- Use `pnpm install` to install dependencies

### Common Development Tasks
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Run ESLint across all packages
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Run TypeScript type checking

### Working with Specific Apps
- `turbo dev --filter=web` - Run only the web app in development
- `turbo build --filter=web` - Build only the web app
- `turbo lint --filter=web` - Lint only the web app

### Testing
- Individual packages may have their own test scripts
- Check each package's `package.json` for specific test commands

## Architecture

### Project Structure
This is a Turborepo monorepo with the following structure:

**Apps:**
- `apps/web/` - Main Next.js application with Instagram content management features

**Packages:**
- `packages/ui/` - Shared React component library using Radix UI primitives
- `packages/hooks/` - Custom React hooks for analytics, brand products, Instagram analysis, etc.
- `packages/supabase/` - Supabase client configuration (client/server)
- `packages/types/` - TypeScript type definitions
- `packages/eslint-config/` - Shared ESLint configurations
- `packages/typescript-config/` - Shared TypeScript configurations

### Key Technologies
- **Frontend:** Next.js 15.3.4 with React 19, TypeScript, Tailwind CSS
- **Authentication:** Supabase Auth with SSR
- **State Management:** Zustand
- **UI Components:** Radix UI primitives with custom styling
- **Image Management:** Cloudinary integration
- **Video Player:** Video.js with quality selector
- **Charts:** Chart.js
- **Animation:** Framer Motion

### Authentication Flow
- Uses Supabase SSR with middleware for session management
- Middleware handles auth state across server components
- Auth routes: `/auth/login`, `/auth/sign-up`, `/auth/forgot-password`

### State Management
- Brand selection: `store/brandStore.ts`
- Industry selection: `store/industryStore.ts`
- Uses Zustand for client-side state

### Key Features
- Instagram content analysis and organization
- SEO blog writing tools
- Image gallery with Cloudinary integration
- Analytics dashboard
- Content spark tools for social media

## Important Configuration

### Environment Variables
Required for Cloudinary integration:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Required for Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Next.js Configuration
- TypeScript and ESLint errors are ignored during builds (configured in next.config.ts)
- Cloudinary images are configured as remote patterns
- Custom webpack optimization for Cloudinary bundle splitting
- Security headers configured for image gallery routes

### Workspace Dependencies
- Internal packages use `workspace:*` versioning
- All packages are TypeScript-based
- Shared configurations ensure consistency across packages

## Development Notes

### Code Style
- Uses Prettier for formatting
- ESLint configuration extends Next.js and React best practices
- TypeScript strict mode enabled across all packages

### Key Routes
- `/workspace/` - Main application workspace
- `/workspace/analytics/` - Analytics dashboard
- `/workspace/content-spark/` - Content creation tools
- `/workspace/instagram-analysis/` - Instagram analysis tools

### Component Architecture
- UI components in `packages/ui/src/components/ui/`
- Business logic components in `apps/web/components/`
- Custom hooks abstracted to `packages/hooks/`

### API Routes
Located in `apps/web/app/api/`:
- `/api/cloudinary/*` - Cloudinary operations (upload, transform, search, etc.)
- Authentication handled via Supabase middleware

### Performance Optimizations
- Bundle splitting configured for Cloudinary
- Package imports optimized in Next.js config
- Image optimization with multiple formats (WebP, AVIF)
- Virtualized lists for large datasets