# Agent Guidelines & Project Architecture

This document is the working architecture map for AI agents contributing to the AriaType monorepo. It focuses on the current repository state rather than an idealized design.

## 1. Repository Overview

AriaType is a `pnpm` monorepo centered on a Tauri desktop app and a marketing/download website.

### 1.1 Workspace Layout

- **`apps/desktop/`**: Main product. Tauri v2 desktop app with a React/Vite frontend and a Rust backend.
- **`packages/shared/`**: Small shared TypeScript package exporting cross-project types and constants.
- **`packages/website/`**: Marketing website and download pages built with Next.js App Router and Tailwind CSS.
- **`scripts/`**: Repository-level utilities for signing, copying installers, i18n checks, and release support.
- **`.github/workflows/`**: CI/CD definitions for desktop releases and website deployment.

### 1.2 Root Tooling

- Package manager: `pnpm`
- Workspace config: `pnpm-workspace.yaml`
- Required engines: Node `>=18`, pnpm `>=8`
- Common root scripts:
  - `pnpm dev`: desktop dev flow
  - `pnpm build`: macOS desktop build flow
  - `pnpm dev:website`: website development
  - `pnpm build:website`: website production build
  - `pnpm check:i18n`: translation key verification

## 2. Monorepo Architecture

### 2.1 Desktop App

The desktop app is the core product and is split into a TypeScript frontend in `apps/desktop/src/` and a Rust backend in `apps/desktop/src-tauri/src/`.

#### Frontend Structure

- Stack: React 19, Vite 6, TypeScript, Tailwind CSS, Framer Motion, Radix primitives, lucide-react
- Entry points:
  - `src/main.tsx`: main settings window bootstrap
  - `src/pill.tsx`: floating pill window bootstrap
  - `src/toast.tsx`: toast window bootstrap
- Main router:
  - `src/App.tsx` defines the settings routes
  - `src/components/Home/HomeLayout.tsx` provides the primary settings shell/navigation
- Window model:
  - Main window: settings and model configuration
  - Pill window: compact always-on-top recording indicator
  - Toast window: transient notifications
- State model:
  - Current app-wide settings are managed through `src/contexts/SettingsContext.tsx`
  - Most behavior-specific state lives in custom React hooks such as `useSettings`, `useRecording`, `usePermissions`, `useNavBadges`, and `useOnboarding`
  - The current codebase depends on `zustand`, but the active settings flow is context + hooks, not a Zustand store
- Tauri bridge:
  - `src/lib/tauri.ts` is the typed frontend boundary for Tauri `invoke` calls and event listeners
  - Prefer extending this file instead of scattering raw `invoke()` calls throughout UI code
- i18n:
  - Desktop translations live in `src/i18n/locales/`
  - Current locale set includes `de`, `en`, `es`, `fr`, `it`, `ja`, `ko`, `pt`, `ru`, `zh`

#### Frontend Feature Areas

- `src/components/Home/`: settings pages, onboarding, permissions, logs, model management
- `src/components/Pill/`: pill UI and recording visualization
- `src/components/Toast/`: toast UI
- `src/components/ui/`: shared UI primitives and inputs
- `src/lib/analytics.ts` and `src/lib/events.ts`: frontend analytics/event naming

#### Backend Structure

- Runtime entry:
  - `src-tauri/src/main.rs` is intentionally thin and delegates to `ariatype_lib::run()`
  - `src-tauri/src/lib.rs` is the real application bootstrap and command registration point
- Major modules:
  - `audio/`: recording, resampling, beep playback, VAD-related processing, level metering
  - `commands/`: Tauri IPC commands for audio, models, settings, permissions, system APIs, text injection, and window control
  - `events/`: backend event names emitted to the frontend
  - `polish_engine/`: text polishing engines, including local models and cloud-backed providers
  - `stt_engine/`: STT engine abstraction for Whisper and SenseVoice
  - `state/`: unified runtime application state
  - `text_injector/`: platform-specific text insertion
  - `utils/`: paths, download helpers, and shared backend utilities

#### Backend Runtime Behavior

- `lib.rs` initializes:
  - logging and log retention
  - Tauri plugins
  - global `AppState`
  - invoke handlers for all IPC commands
  - startup threads for audio monitoring, warmup, permissions, and model download behavior
- `state/unified_state.rs` is the key runtime state container:
  - recording lifecycle state machine
  - settings snapshot loaded from disk
  - STT engine manager
  - polish manager
  - model download cancellation bookkeeping
  - transcription queue/task coordination
- Settings persistence:
  - backend settings are defined in `commands/settings.rs`
  - settings are loaded from `AppPaths::data_dir()/settings.json`
  - frontend updates flow through the `update_settings` Tauri command and are rebroadcast via `settings-changed`
- Model architecture:
  - STT currently supports Whisper and SenseVoice
  - Polish currently supports local Qwen/LFM-style engines and cloud providers
  - Unified managers handle engine selection, model loading, caching, and downloads

#### Platform-Specific Notes

- macOS has extra window and permission behavior:
  - the pill window is converted to an `NSPanel`
  - microphone and accessibility flows are initialized during startup
- Tauri capabilities live in `src-tauri/capabilities/`
- macOS and Windows each have dedicated Tauri config files under `src-tauri/`

### 2.2 Shared Package

`packages/shared/` is intentionally lightweight.

- Source of truth is the `.ts` files in `packages/shared/src/`
- `src/index.ts` re-exports `types.ts` and `constants.ts`
- The committed `.d.ts` and `.d.ts.map` files are build artifacts; prefer editing the `.ts` sources unless you are intentionally regenerating published outputs

### 2.3 Website

The website is a separate Next.js App Router app used for product marketing, documentation-lite pages, and installer downloads.

#### Website Structure

- Stack: Next.js 14, React 18, Tailwind CSS, Framer Motion, `react-i18next`
- App entry:
  - `packages/website/src/app/layout.tsx` wires global providers
  - `packages/website/src/app/[lang]/layout.tsx` provides navbar/footer and language-scoped layout
- Route model:
  - localized routes live under `src/app/[lang]/`
  - current static params only include `en` and `zh`
  - root path redirects to `/en/` via `public/_redirects`
- i18n:
  - website translations currently exist only for `en` and `zh`
  - path-based language detection is configured in `src/i18n/index.ts`
- Main supporting modules:
  - `src/components/I18nProvider.tsx`: browser-only i18n provider mount
  - `src/components/AnalyticsProvider.tsx`: Aptabase analytics wiring
  - `src/hooks/useRelease.ts`: release metadata and platform detection
  - `src/hooks/useDownload.ts`: download CTA behavior and analytics

#### Website Build/Deploy Model

- Production builds use static export mode via `next.config.mjs`
- Static files for downloads are served from `packages/website/public/release/`
- Cloudflare Pages is the deployment target
- `wrangler.toml` contains Pages configuration for production and preview environments

## 3. Release & Operations Flow

### 3.1 Scripts Directory

Common repository scripts currently include:

- `scripts/check-i18n.mjs`: verifies missing/unused translation keys
- `scripts/remove-unused-i18n.mjs`: translation cleanup helper
- `scripts/copy-installers.mjs`: copies built installers into website assets
- `scripts/sign-macos-binaries.mjs`: signing helper for macOS release builds
- `scripts/build-windows.sh`: Windows build helper

### 3.2 GitHub Workflows

- `release.yml`:
  - builds macOS and Windows desktop artifacts
  - publishes installers to the public `ariatype/releases` repository
  - updates the Homebrew tap
  - copies release assets into `packages/website/public/release/`
  - builds and deploys the website
- `deploy-website.yml`:
  - deploys the website on changes under `packages/website/**`

## 4. Agent Rules

### 4.1 General Contribution Rules

- Always use `pnpm` for JavaScript/TypeScript workspace changes
- Make changes in the correct workspace rather than at the monorepo root
- Follow the existing coding style of the touched package instead of introducing a new local pattern
- Prefer extending existing abstractions over adding parallel ones

### 4.2 Desktop Frontend Rules

- Add new Tauri calls in `src/lib/tauri.ts` so the frontend keeps a typed IPC boundary
- Reuse the existing settings/context/hook pattern before introducing new state containers
- Preserve the multi-window mental model; check whether a change belongs to the main, pill, or toast window
- Any new user-facing copy must use i18n keys and update desktop locale JSON files

### 4.3 Desktop Backend Rules

- Register new Tauri commands in `src-tauri/src/lib.rs`, not only in command modules
- If a feature needs additional permissions or exposure, review `src-tauri/capabilities/`
- Keep platform-specific logic isolated in the existing OS-specific modules when possible
- Use the unified state and manager layers rather than bypassing them with ad hoc globals

### 4.4 Website Rules

- Keep localized content under `src/app/[lang]/`
- When adding website copy, update both current website locales: `en` and `zh`
- Respect the static-export constraints in `next.config.mjs`; avoid introducing features that require a Node server unless the deployment model is deliberately changed

### 4.5 UI Style Guide

When building or modifying segmented tabs, follow the existing Tailwind pattern used in the desktop app.

#### Container

- Class: `inline-flex h-10 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground`

#### Trigger Base

- Class: `inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`

#### State Variants

- Active: `bg-background text-foreground shadow-sm`
- Inactive: `hover:text-foreground`

Example:

```tsx
import { cn } from "@/lib/utils";

<div className="inline-flex h-10 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground">
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      isActive ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
    )}
  >
    Tab 1
  </button>
</div>
```

## 5. Verification Expectations

There is no single root lint/typecheck script for every workspace, so verify changes with the smallest relevant command set.

- Desktop frontend changes: use `pnpm --filter @ariatype/desktop build` when feasible
- Shared package changes: use `pnpm --filter @ariatype/shared typecheck`
- Website changes: use `pnpm --filter @ariatype/website build` and `pnpm --filter @ariatype/website lint` when applicable
- Translation changes: use `pnpm check:i18n`
- Rust changes: use standard Rust formatting/testing workflows inside `apps/desktop/src-tauri/`
