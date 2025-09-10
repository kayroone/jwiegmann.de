# Jan Wiegmann - Personal Website

A modern, minimalist personal website built with Next.js 15 and clean architecture principles.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with TypeScript
- **Tailwind CSS** - Utility-first styling with custom design system
- **Framer Motion** - Smooth animations and transitions
- **Radix UI** - Accessible UI primitives (Dialog, Aspect Ratio)
- **Lucide React** - Icon library

## Architecture

Clean, backend-inspired structure for maintainability:

```
app/                     # Next.js App Router
├── components/          # Page-specific components
├── about/              # About page
└── blog/               # Blog pages with dynamic routing

components/             # Reusable components
├── ui/                 # UI primitives (shadcn/ui components)
└── theme-provider.tsx  # Theme management

hooks/                  # Custom React hooks
lib/                    # Utilities & helper functions
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Pages

- `/` - Home with animated hero and blog preview
- `/about` - Personal information and background
- `/blog` - Blog overview (coming soon)
- `/blog/[slug]` - Individual blog posts (coming soon)

Built with ❤️ by Jan