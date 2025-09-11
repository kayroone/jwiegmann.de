# Jan Wiegmann - Personal Website

My minimalistic personal website built with Next.js 15.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with TypeScript
- **Tailwind CSS** - Utility-first styling with custom design system
- **Framer Motion** - Animations and transitions
- **Radix UI** - Accessible UI primitives (Dialog, Aspect Ratio)
- **Lucide React** - Icon library
- **Gray Matter** - Frontmatter parser for blog posts
- **Remark** - Markdown processor and AST parser

## Structure

```
app/                    # Next.js App Router
├── components/         # Page-specific components
├── about/              # About page
└── blog/               # Blog pages with dynamic routing

components/             # Reusable components
├── ui/                 # UI primitives (shadcn/ui components)
└── theme-provider.tsx  # Theme management

content/blog/           # Markdown blog posts
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

- `/` - Home with animated background and blog preview
- `/about` - Personal information and background
- `/blog` - Blog overview with Markdown articles
- `/blog/[slug]` - Individual blog posts rendered from Markdown

## Markdown Processing Pipeline

This is how I publish my blog-posts. From markdown to HTML:

```
📁 first-post.md
    ↓ fs.readFileSync()
"---\ntitle: Test\n---\n# Hello\n**bold**"
    ↓ matter()
{ data: {title: "Test"}, content: "# Hello\n**bold**" }
    ↓ remark()
AST: { type: 'root', children: [heading, paragraph] }
    ↓ remarkBreaks
AST + Zeilenumbrüche als <br>
    ↓ remarkRehype  
HTML AST: { type: 'element', tagName: 'h1' }
    ↓ rehypeHighlight
HTML AST + <span class="hljs-keyword">
    ↓ rehypeStringify
"<h1>Hello</h1><p><strong>bold</strong></p>"
    ↓ dangerouslySetInnerHTML
🌐 Gerenderte HTML-Seite
```

Built with ❤️ by Jan