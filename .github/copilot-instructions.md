# Copilot Instructions for LexiClue

## What This Project Is

LexiClue (subtitle: "ThemeShift: Vocabulary Quest") is a theme-based word guessing game. One player gives verbal clues about a word; others guess it (similar to Taboo). Google Gemini AI generates themed vocabulary lists at runtime. Supports two game modes:
- **RACE**: Correctly guess 5 words before time runs out
- **ENDLESS**: Guess as many words as possible before time expires

Built to run on Google AI Studio and locally.

## Commands

```bash
npm run dev       # Dev server at http://localhost:3000
npm run build     # Production build (output: dist/)
npm run lint      # TypeScript type check (tsc --noEmit)
npm run preview   # Preview production build
npm run clean     # Remove dist/
```

There is no test suite.

## Architecture

The entire application is a **single monolithic component** in `src/App.tsx` (~1070 lines). There are no subdirectories, no component extraction, and no routing library.

**State machine** drives all UI transitions via `gameState`:
```
SETUP → LOADING → PLAYING → GAME_OVER
                           → VICTORY
```

`AnimatePresence` from the `motion` library wraps each state's JSX for animated transitions.

## Key Types

```typescript
type GameState = 'SETUP' | 'LOADING' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type GameMode = 'RACE' | 'ENDLESS';
type Language = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'ja' | 'zh';
```

## Conventions

- **All UI strings live in `TRANSLATIONS`** — a top-level constant keyed by `Language`. Never hardcode display text; always reference `t.someKey` where `t = TRANSLATIONS[language]`.
- **Constants are `UPPER_SNAKE_CASE`**: `LANGUAGES`, `TRANSLATIONS`, `RACE_WORD_TARGET`, etc.
- **State is local React hooks only** — no Redux, Zustand, or Context. All `useState`/`useEffect` calls are inside `App`.
- **Styling is Tailwind-only** — no CSS modules or inline style objects except for truly dynamic values (e.g., computed font size based on word length). Global CSS in `src/index.css` is just `@import "tailwindcss";`.
- **Animation via `motion`** (not `framer-motion` directly) — import as `import { motion, AnimatePresence } from "motion/react"`.
- **Icons from `lucide-react`** — check existing imports before adding new icon packages.

## Gemini API Integration

The API key is injected at build time via Vite's `define` in `vite.config.ts`:
```typescript
'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
```

Set `GEMINI_API_KEY` in `.env.local` for local development. The API call uses a structured output schema expecting `{ words: string[] }` and uses `ThinkingLevel.NONE` for faster responses.

## Environment

- `GEMINI_API_KEY` — required; Gemini API key
- `APP_URL` — injected by AI Studio for OAuth/links
- `DISABLE_HMR` — disables Vite HMR when set (used in AI Studio cloud environment)

## Path Alias

`@/` resolves to the project root (configured in both `vite.config.ts` and `tsconfig.json`), though it is not currently used in the source.
