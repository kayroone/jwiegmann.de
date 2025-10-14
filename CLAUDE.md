# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Jan Wiegmann's personal website - a minimalistic blog and portfolio built with Next.js 15, TypeScript, and Tailwind CSS. The site features a markdown-based blog system with syntax highlighting and a clean, animated design.

## Development Commands

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint (configured to not block builds)
```

## Architecture

**Next.js 15 App Router Structure:**
- `/app/` - Pages and page-specific components
- `/components/` - Reusable UI components (uses shadcn/ui)
- `/content/blog/` - Markdown blog posts with frontmatter
- `/lib/blog.ts` - Blog processing pipeline using remark/rehype
- `/hooks/` - Custom React hooks

**Key Technologies:**
- Next.js 15 with React 19 and TypeScript
- Tailwind CSS with CSS variables for theming
- shadcn/ui component library
- Framer Motion for animations
- Sophisticated markdown processing (remark → rehype → syntax highlighting)

## Blog System

The blog uses a markdown processing pipeline in `lib/blog.ts`:
1. Parse frontmatter with gray-matter
2. Process markdown with remark (including line breaks)
3. Convert to HTML with rehype and syntax highlighting
4. Sort posts by date, generate slugs from filenames

Blog posts go in `/content/blog/` with frontmatter:
```yaml
---
title: "Post Title"
date: "2024-01-01"
excerpt: "Brief description"
tags: ["tag1", "tag2"]
---
```

## Styling System

Uses shadcn/ui with Tailwind CSS:
- Component aliases: `@/components`, `@/lib/utils`
- CSS variables in `styles/globals.css` for theming
- Dark/light mode support with `class` strategy
- Component configuration in `components.json`

## Development Notes

- ESLint configured to ignore build errors for faster development
- No testing framework currently configured
- TypeScript in strict mode with path aliases
- Deployment via GitHub Actions to personal server
- Images are unoptimized for static deployment

## Commit Message Guidelines

- Use clean, professional commit messages without Claude Code signatures
- Do not include "🤖 Generated with [Claude Code]" or "Co-Authored-By: Claude" in commit messages
- Keep commits focused and descriptive