# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run generate     # Static site generation
npx nuxi lint        # Lint
npx vitest           # Run all tests
npx vitest tests/useSketchCanvas.nuxt.test.ts  # Run a single test file
```

The API base URL defaults to `http://localhost:8000`. Override via `NUXT_PUBLIC_API_BASE_URL` in `.env`.

## Architecture

Nuxt 4 app with all source under `app/`. File-based routing (`app/pages/`), auto-imported composables (`app/composables/`), and components (`app/components/`). No Pinia — all shared state uses Nuxt's `useState` (or module-scoped refs for canvas state).

### Routing & layouts

| Path | Layout | Notes |
|------|--------|-------|
| `/login` | `auth` | **public** |
| `/gedeeld/[token]` | `public` | **public** — read-only shared sketch view |
| `/schetsen/[id]`, `/schetsen/nieuw` | `editor` | Sketch editor (also aliased at `/projecten/[id]/schetsen/[sketch]`) |
| `/projecten`, `/projecten/[id]`, `/projecten/aanmaken`, `/mijn-schetsen` | `default` | Listing & project pages |
| `/health` | `default` | Status page |

`app/middleware/auth.global.ts` redirects every route to `/login` unless the user is authenticated. Exceptions: exact match `/login`, and any path starting with `/gedeeld/`. The `useAuth.fetchCurrentUser()` call hydrates `user.value` on first protected navigation.

### Auth

`useAuth` stores a bearer token in the `auth_token` cookie. `useApi` reads this cookie and attaches it to every request. On `401`, `useApi` clears the cookie and redirects to `/login`. Errors are thrown via `createError` so pages can use Nuxt's error handling.

### Canvas and VueFlow

`useSketchCanvas` (in `app/composables/useSketchCanvas.ts`) is the central composable. It wraps `useVueFlow(SKETCH_CANVAS_ID)` and owns:

- `fetchSketch(id)` — loads `canvas_state.nodes` + `edges` into VueFlow; strips invalid `markerEnd`/`markerStart` to avoid VueFlow's `url('#')` bug; restores `show_dots` via `useDotsToggle`
- `watchAndSave(id)` — registers `onNodesChange` / `onEdgesChange` / `onNodeDragStop` and debounce-saves to `PUT /api/sketches/{id}` (debounce from `app.config.ts → sketch.saveDebounceMs`, default 2000 ms)
- `clearCanvas()` — resets all VueFlow + history + tool state; **must be called on every route leave** from the editor (otherwise state leaks across sketches)
- `stopSaving()` — tears down listeners without clearing canvas (used when navigating between sketches)
- `addNodeWithHistory`, `addEdgeWithHistory`, `updateEdgeLabelWithHistory`, `updateEdgePropertiesWithHistory`, `updateNodeLabelWithHistory`, `reconnectEdgeWithHistory`, `changeNodeTypeWithHistory` — every mutation that should be undoable goes through one of these wrappers; they call `snapshot()` before mutating and `currentSave()` after
- `saveStatus` (`idle` / `pending` / `saving` / `saved` / `error`) + `saveError` — surfaced in `Topbar.vue` as the autosave indicator
- `undo`, `redo` — delegate to `useSketchHistory` and trigger a save if a snapshot was applied

`useSketchHistory` maintains `past` / `future` snapshot stacks (max 50). `useSketchHistoryWatcher` (exported from the same file) registers `onNodeDragStart` so drag moves are also undoable. Both are mounted/unmounted inside `Canvas.vue`.

`useDotsToggle` controls the grid-dots visibility — note that its value is **part of `canvas_state`** (`show_dots` key) and persisted with every save. It's not local UI state.

### Toolbar tool system

Three composables build on `useActiveTool` (which holds a `useState` named `'active-tool'`):

- `useNodeTool` — tracks `selectedNodeType` and `isPlacingNode`; `stopPlacing()` resets both and switches `activeTool` back to `'drag'`
- `useEdgeTool` — tracks `activeEdgeTool` and computes `defaultEdgeOptions` (marker arrows)
- `useDragTool` — derived from `activeTool`; `isDragToolActive` flips VueFlow into pan mode
- `usePointerTool` — selection / hover handling

After a node is placed (`onPaneClick` in `Canvas.vue`) `stopPlacing()` is called, resetting the tool to drag.

### Other composables

| Composable | Role |
|------------|------|
| `useApi` | Wraps `$fetch` with auth header + 401 redirect; exposes `get/post/put/patch/delete` |
| `useProjects`, `useSketches`, `useCreateSketch` | List/create CRUD against the API |
| `useNodeTypes`, `usePublicNodeTypes` | Fetch node-type catalogue (auth + public variants) |
| `useExport` | Calls `POST /api/export/mermaid` and triggers download |
| `useCopyPaste` | Clipboard for nodes — invoked from `useDeleteNode`'s key handler |
| `useNodeContextMenu`, `useEdgeContextMenu` | Right-click menus mounted in `Canvas.vue` |
| `useSketchTopbar` | State for `Topbar.vue` (title editing, share dropdown) |
| `useSharedSketch` | Public viewer — loads `GET /api/shared/{token}` and populates a read-only canvas |
| `useHealth` | `/health` page status |

### Public sharing

`pages/gedeeld/[token].vue` uses `layout: 'public'` and renders `sketch/PublicCanvas.vue` with `sketch/PublicNode.vue` / `sketch/PublicNoteNode.vue`. These are stripped-down copies of the editor components — no toolbar, no save, no history, read-only VueFlow. Sharing is toggled from the editor via `sketch/ShareDropdown.vue`, which calls `POST /api/projects/{p}/sketches/{s}/share`.

### Keyboard shortcuts

Registered globally in `useDeleteNode` (mounted in `Canvas.vue`). Copy/paste is delegated to `useCopyPaste`:

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected nodes + their edges |
| `Ctrl/Cmd+Z` | Undo |
| `Ctrl/Cmd+Y` / `Ctrl/Cmd+Shift+Z` | Redo |
| `Ctrl/Cmd+C` / `V` | Copy / paste selected nodes |

### Styling

Tailwind v4 with a custom theme defined in `app/assets/css/main.css`. Always use:
- `--color-primary-*` (pink/magenta) and `--color-secondary-*` (dark navy) tokens
- `font-heading` (Syne Bold) for headings, `font-body` (Nunito) for body text
- `lucide-vue-next` for icons

### Testing

Tests use `@nuxt/test-utils` with a Nuxt environment (vitest). `useVueFlow` and `useApi` are mocked with `vi.mock` / `mockNuxtImport`. Tests live in `tests/`.
