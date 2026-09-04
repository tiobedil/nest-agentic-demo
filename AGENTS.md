# Agent Rules — nest-agentic-demo

Rules for any agent (this session or another) working in this repo. Follow these unless the user explicitly overrides.

## Typography

- **Font family**: Plus Jakarta Sans — always.
  - CSS variable: `var(--font-sans)` (or just use Tailwind `font-sans` / `font-heading`).
  - The font is registered via `@fontsource-variable/plus-jakarta-sans` and exposed as a Tailwind v4 theme token in `src/index.css` (`@theme inline { --font-sans: ... }`).
- **Never** hardcode `font-family: "Plus Jakarta Sans", system-ui, sans-serif` inline or in `style={}`. Use the design token / Tailwind class instead.
- For one-off elements, prefer `className="font-sans"` (Tailwind) over an inline font stack.

## Component reuse — NEVER duplicate, ALWAYS reuse

Existing components are first-class. Before writing new JSX, search `src/components/` and `src/` and reuse.

| Need | Reuse |
|---|---|
| Top navigation | `@/components/TopNavbar` |
| Chat input bar | `@/components/chat/PromptBar` |
| Thinking animation (loader grid + stage list) | `@/components/chat/Thinking` |
| Streamed reply text | `@/components/chat/StreamingText` |
| Buttons | `@/components/ui/button` (`Button`, `buttonVariants`) |
| Card surfaces | `@/components/ui/card` (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`, etc.) |

Mock chat reply used by `App.tsx` and reusable for demos:

> "This is a mock reply returned for every message to verify the chat flow. The assistant first shows a Thinking state for about six seconds, then streams this paragraph as if it were generated live. In a real implementation this content would be replaced by an LLM response, with support for markdown, code blocks, and follow up actions. For now the text is intentionally longer so you can judge line height, wrapping, and readability in the final layout."

## Color & background

- Default page background is **pure white `#FFFFFF`** (token: `--background` / `bg-background`).
- Mute text uses Tailwind `text-slate-500` / `text-slate-700` for hierarchy — avoid raw hex.
- Primary brand purple is `violet-600` / `violet-100` (the shadcn `--primary` token resolves to a violet hue).
- **MEMORI — Date picker & field styling (flow-2 /pgagent2, 2026-09-03)**: Untuk field date picker di bawah carousel PgAgent2 (Figma node 7231-440557, Nest — Reservation) **jangan gunakan border** (`border-0` / tanpa `border`), dan **jangan gunakan warna hitam pure `#000000`** untuk teks/icon/background. Gunakan hierarki `text-slate-700` / `text-slate-500` / `text-foreground` / `text-muted-foreground` dan `bg-slate-50` / `bg-white` / `bg-violet-50` sesuai design system. Aturan ini harus diingat oleh agent dan session lain ke depan — komponen shadcn yang digunakan (Calendar, Popover) juga harus disesuaikan tanpa border dan tanpa `#000000`.

## Routes

- `/` → `App` (chat)
- `/playground` → `Playground` (TopNavbar only)
- `/page-test` → `PageTest` (Task Management + Agent Chat, reuses chat components)
- New pages: add a file in `src/<PageName>.tsx`, export a named component, and register a route in `src/routes.tsx`.
- The router is wrapped by `src/RootLayout.tsx`, which renders `<Outlet />` plus `<Agentation />` **only when `import.meta.env.DEV` is true**. New pages automatically get the dev agentation overlay without any per-page wiring. Never mount `Agentation` directly inside a page component — always rely on `RootLayout`.

## Dev

- `npm run dev` → Vite on `http://localhost:5173` (auto-bumps if busy).
- After installing a new dependency, restart the dev server so Vite picks it up.
- `Agentation` is mounted via `RootLayout` and gated by `import.meta.env.DEV` — it shows in dev only, never in production builds. Don't move it into individual page components.

## Conventions

- No comments in code unless asked.
- Match existing file style: functional components, named exports, `import { ... } from "lucide-react"`, Tailwind utilities, no CSS modules.
- All Paper/figma-derived designs must use these tokens and components — do not invent new fonts, colors, or rebuild the chat panel.

## Cursor

- **MEMORI — Global cursor (2026-09-04)**: Setiap elemen yang bisa di-klik (`button`, `a`, `[role="button"]`, elemen dengan `onClick` / `cursor-pointer`) **harus** menampilkan `cursor: pointer` saat hover. Implementasi global di `src/index.css` (`@layer base { button, a, [role="button"] { cursor: pointer } }`) dan tambahkan `cursor-pointer` pada komponen kustom yang klikable. Aturan ini global dan harus diingat semua agent/session ke depan.
