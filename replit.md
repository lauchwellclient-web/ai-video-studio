# FRAME/15

FRAME/15 turns a text prompt into a 15-second storyboard and browser-rendered WebM clip.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ai-video-studio` — the React/Vite studio UI and browser-side video export
- `artifacts/api-server/src/routes/videos.ts` — prompt-to-storyboard generation API
- `lib/api-spec/openapi.yaml` — source of truth for the video API contract
- `lib/api-client-react` and `lib/api-zod` — generated API clients and validation types
- `artifacts/ai-video-studio/.replit-artifact/artifact.toml` — preview and deployment routing

## Architecture decisions

- The first build uses a prompt-driven local scene planner so the product works without a provider key; the API shape can accept a hosted model later.
- Video export happens in the browser with Canvas capture and MediaRecorder, producing a real 15-second WebM instead of a static preview.
- Generated projects are held in the API process for this MVP; the contract is separated so persistence can move to PostgreSQL without changing the UI.

## Product

Users can enter a director's prompt, choose frame and visual direction, generate a three-scene 15-second project, preview it, browse recent creations, copy/share the prompt, and export a WebM clip.

## User preferences

No additional preferences recorded.

## Gotchas

- Download requires a browser with Canvas capture and MediaRecorder support, such as current Chrome or Edge.
- The API's in-memory project list resets when the API workflow restarts.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
