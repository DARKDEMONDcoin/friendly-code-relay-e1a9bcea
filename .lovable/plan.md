## Goal
Make "Create Website" in chat work end-to-end: real progress, public URL, downloadable files list with code viewer — using the existing `build_website` pipeline.

## What already exists (no rebuild needed)
- `supabase/functions/_shared/odysseus/build-website.ts` — async builder that plans files, runs Vite build in an E2B sandbox, and uploads the dist to the `published-sites` storage bucket.
- `generated_sites` table (id, status, progress, tasks jsonb, preview_url, …) with realtime hookup.
- `chat-alibaba` detects website intent and forces the `build_website` tool call.

## What's missing → what this plan ships

### 1. Database
Add two columns to `generated_sites`:
- `files jsonb` — array of `{ path, content }` so the chat can show the source.
- `published_url text` — final public URL (the `dist/index.html` after upload). Today only `preview_url` exists and it's the same thing, but we'll set this on the row once the upload succeeds so the frontend can flip the UI to "done".

### 2. Backend persistence
Update `build-website.ts`:
- After the plan step, write `files` to the row (truncate any single file's content to 200 KB; cap total to ~2 MB).
- After the storage upload succeeds, write `published_url` and set `status = "done"`, `progress = 100`.

### 3. New assistant card: `SiteBuildCard.tsx`
- Accepts `siteId`. Subscribes to `generated_sites` realtime updates.
- Shows: spinner + current task label + progress bar while `status = "building"`.
- When done: large "🌐 Open website" link, secondary "⬇️ Download ZIP" (built client-side from `files` via JSZip), and a collapsible **Files** panel listing every path; clicking a file opens a code viewer (simple `<pre>` with mono font + line numbers, no heavy syntax highlighter to keep bundle small).
- If `status = "error"`, shows `error_message` and a "Try again" hint.

### 4. Chat wiring
- Extend `Message` type with `siteBuild?: { siteId: string }`.
- In `runChatStreamTurn.ts` (or the central tool-result interceptor in the stream), when a `build_website` tool result arrives, parse `site_id` from the JSON result and attach it to the assistant message + persist into the saved row's metadata.
- Fallback: if the stream parser misses it, regex-extract the `site_id` from the `preview_url` pattern `/published-sites/<user>/<siteId>/index.html` in the assistant text.
- `rowToMessage.ts` already handles metadata — add `siteBuild` restore so reloading the chat brings the card back identically to the media card persistence I just shipped.

### 5. Rendering
- In `ChatMessageItem.tsx`, if `msg.siteBuild?.siteId`, render `<SiteBuildCard siteId={…} />` instead of (or above) the markdown body.

## Non-goals (skip for now)
- Editing files in-chat or re-deploying after edits.
- Custom domain on each generated site.
- Server-side ZIP packaging (client-side JSZip is enough for a few-MB site).

## Technical details
- Realtime: standard `supabase.channel('site:'+id).on('postgres_changes', { table:'generated_sites', filter:'id=eq.'+id }).subscribe()` inside `useEffect` with cleanup.
- ZIP: `bun add jszip` (small, ~30 KB gz).
- The `files` column write happens via the service role inside the edge function, so no new RLS needed; reads use existing user-owned `SELECT` policy on `generated_sites`.

## Verify before shipping
- Trigger "ابني لي موقع landing لمطعم" → see card appear → progress ticks → final URL opens a real site → files list shows ~15-30 files → clicking `App.tsx` shows the JSX source → ZIP downloads and unzips cleanly.
- Refresh the chat tab → card returns with the same state.
