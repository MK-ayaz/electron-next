# Debugging and Update Plan

## Goals
- Enable reliable debugging for Electron main and renderer processes.
- Provide scripts for Node/Electron inspection in development.
- Keep Electron/Next.js aligned with latest stable versions and notes.

## Debugging Setup
- VS Code configs added in `.vscode/launch.json`:
  - Electron: Main (Launch) → launches with `--inspect=9229`.
  - Electron: Renderer (Attach) → attaches to `remote-debugging-port=9222`.
  - Next.js (Server Inspect) → runs `next dev` with `NODE_OPTIONS=--inspect`.
- Electron main enables `remote-debugging-port=9222` in dev to allow renderer attach.
- Scripts:
  - `npm run debug:main` → inspect main process.
  - `npm run debug:next` → inspect Next.js server.

## Update Guidance
- Electron: `npm i electron@latest` (review Electron release notes for breaking changes).
- Next/React: `npm i next@latest react@latest react-dom@latest` (review Next.js blog/migrations).

## Known Issues and Fixes
- ✅ Fixed preload `fileOperations.saveFile/saveFileAs` to forward `content`.
- ✅ Centralized file operations from `main/fileOperations.js` and wired in `src/main.js`.
- ✅ Fixed file-save logic bug that incorrectly called file-save-as handler.
- ✅ Added Content Security Policy headers (development mode still shows warning - this is normal).
- ✅ Created `next.config.js` for proper Electron integration.
- ✅ Updated dependencies: Electron Forge, Next.js, and utility packages.
- ✅ Removed Next.js headers configuration that conflicted with export mode.
- Avoid `file://` routing issues by continuing to serve renderer from `http://localhost:3000` in dev; for prod, build Next.js and load generated HTML files.

## Test Steps
1. Run `npm run dev` and confirm:
   - Splash shows for ~7.4s then main window appears.
   - Title bar buttons work (minimize/maximize/close).
   - Menu shortcuts (Ctrl+N/Ctrl+O/Ctrl+S/Ctrl+Shift+S) trigger handlers.
2. Start "Electron: Main (Launch)" and set breakpoints in `src/main.js`.
3. Start "Electron: Renderer (Attach)" and set breakpoints in React code.
4. Start "Next.js (Server Inspect)" to debug server components if needed.

## Production Notes
- Ensure Next.js output is packaged, and `src/main.js` loads the built files.
- Verify preload path resolution when packaged (already handled via `process.resourcesPath`).

## Next Steps
- Add unit tests for file operations and IPC.
- Consider CSP and protocol handling for packaged app.
