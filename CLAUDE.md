# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run Next.js ESLint

## Architecture & Structure

This is a Next.js 15 personal website/portfolio built with:

### Core Technologies
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** with CSS variables for theming
- **Framer Motion** for animations
- **shadcn/ui** component library (46 UI components)

### Directory Structure
- `app/` - Next.js App Router pages and layout
  - `app/components/` - Page-specific components (hero, footer, blog-preview, etc.)
  - `app/about/` - About page
  - `app/blog/` - Blog pages with dynamic routing
- `components/` - Reusable components
  - `components/ui/` - shadcn/ui components (46 components)
  - `components/theme-provider.tsx` - Theme management
- `lib/utils.ts` - Utility functions (cn function for class merging)
- `hooks/` - Custom React hooks
- `styles/` and `app/globals.css` - Global styles and Tailwind setup

### Key Configuration
- **TypeScript**: Strict mode enabled with path aliases (`@/*`)
- **Tailwind**: Custom design system with CSS variables, extensive color palette including sidebar and chart colors
- **shadcn/ui**: Configured with default style, RSC, and Lucide icons
- **Next.js**: ESLint and TypeScript errors ignored during builds, images unoptimized, experimental webpack optimizations enabled

### Styling System
- Uses Tailwind CSS with a comprehensive design system
- CSS variables for theming (light/dark mode support indicated by theme-provider)
- Custom colors for backgrounds, cards, popovers, primary/secondary, charts, and sidebar
- Custom animations for accordion components

### Component Patterns
- React Server Components by default
- Client components marked with "use client"
- Extensive use of Radix UI primitives
- Framer Motion for animations
- Lucide React for icons

The codebase follows modern React patterns with TypeScript, uses shadcn/ui for consistent UI components, and implements a personal website with blog functionality and animated hero section.