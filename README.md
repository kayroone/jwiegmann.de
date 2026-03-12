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

## Features

- **Pixel Vine Animation** - Custom canvas-based animation with growing pixel art vines and blooming flowers
- **Markdown Blog** - Full blog system with frontmatter, syntax highlighting, and Mermaid diagrams
- **SEO Optimized** - Dynamic sitemap, robots.txt, OpenGraph metadata, and structured data
- **RSS Feed** - Subscribe to new posts at `/feed.xml`
- **Static Generation** - Pre-rendered pages for optimal performance
- **Accessible** - Semantic HTML and ARIA labels

## Pages

- `/` - Home with animated background and blog preview
- `/about` - Personal information and background
- `/blog` - Blog overview with Markdown articles
- `/blog/[slug]` - Individual blog posts rendered from Markdown
- `/sitemap.xml` - Dynamically generated sitemap for search engines
- `/robots.txt` - Crawler configuration
- `/feed.xml` - RSS feed for blog subscribers

## Markdown Processing Pipeline

This is how I publish my blog-posts. From markdown to HTML:

```
 first-post.md
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
 Gerenderte HTML-Seite
```

## Background Animation

The landing page (`app/components/hero-animation.tsx`) supports two animated themes that can be toggled independently:

| Theme      | Description                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stars**  | Floating white particles drifting across the screen                                                                                                                          |
| **Vines**  | Pixel art vines growing from bottom to top with blooming flowers                                                                                                             |
| **Spring** | Pixel art sun (orange→yellow gradient, animated rays) above the heading + green grass blades with wind animation at the bottom. Activating Spring implicitly disables Vines. |

### Configuration

Toggle themes at the top of `hero-animation.tsx`:

```typescript
const ENABLE_STARS = false; // Floating particles
const ENABLE_VINES = false; // Growing pixel vines (disabled when Spring is on)
const ENABLE_SPRING_THEME = true; // Pixel sun + animated grass
```

### How Vines Work

Each vine goes through a lifecycle:

1. **Spawn** - Appears at screen bottom (left or right side to avoid text)
2. **Grow** - Rises upward with a gentle sine-wave motion, occasionally sprouting leaves
3. **Bloom** - Reaches target height and flower opens in 3 stages (bud → petals → full bloom)
4. **Fade** - Gradually disappears, then a new vine spawns

### How the Sun Works

A pixel art sun centered above the heading (at 22% screen height):

1. **Body** - Circle of 4px pixels with a radial gradient: orange (255,140,0) at center → yellow (255,255,0) at edge
2. **Rays** - 12 rays extend outward at equal angles, each 25px long with fading opacity toward the tip
3. **Glow Pulse** - Each ray pulses independently between dim and bright (color shifts orange↔yellow, opacity 0.25→1.0) using offset sine waves

### How the Grass Works

Pixel art grass blades anchored at the screen bottom with wind animation:

1. **Generation** - Blades are distributed evenly across the canvas width (max 20px gap), each with random height (20–80px) and width (4px or 8px)
2. **Color** - Each blade has a vertical gradient: dark green at the base → lighter green at the tip
3. **Wind** - A sine wave with a leftward bias (`sin(t) - 0.3`) displaces each blade. The displacement increases quadratically from base to tip, so roots stay fixed while tips sway
4. **Phase** - Each blade gets a random phase offset, so they don't all sway in sync

### Code Structure

The animation uses the HTML Canvas API with `requestAnimationFrame` for smooth 60fps rendering.

**Classes:**

| Class        | Purpose                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| `Particle`   | Single floating star with position, size, and velocity                         |
| `PixelVine`  | Growing vine with segments, leaves, bloom state, and fade logic                |
| `PixelSun`   | Pixel art sun with radial orange→yellow gradient and 12 sine-animated rays     |
| `PixelGrass` | Grass blades (mixed 4px/8px widths) with sine-based wind animation biased left |

**PixelVine Properties:**

```typescript
segments[]      // Array of {x, y, hasLeaf, leafSide} - the vine's path
currentY        // Current growth position (decreases as vine grows upward)
targetY         // Height where blooming starts
bloomState      // 0=growing, 1-3=bloom stages, 4=fading
fadeOpacity     // 1.0 → 0.0 during fade phase
```

**Pixel Patterns:**

Flowers and leaves are 2D arrays where each number maps to a color:

```typescript
// Example: 0=transparent, 1=orange, 2=yellow
static flowerStages = [
  [0, 0, 2, 2, 2, 0, 0],
  [0, 2, 1, 1, 1, 2, 0],
  [2, 1, 1, 1, 1, 1, 2],
  // ...
]
```

**Animation Loop:**

```typescript
function animate() {
  ctx.clearRect(...)           // Clear canvas

  if (ENABLE_VINES) {
    // Spawn new vine if < maxVines
    // For each vine: update() + draw()
    // Remove dead vines (fadeOpacity <= 0)
  }

  if (ENABLE_STARS) {
    // For each particle: update() + draw()
  }

  requestAnimationFrame(animate)  // Next frame
}
```

Built with ❤️ by Jan
