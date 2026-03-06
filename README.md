# 📐 CAD Viewer & Extractor

> A fully offline, privacy-first Progressive Web App for viewing and measuring DWG/DXF files — no server, no upload, no ads.

[![Deploy Status](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 📁 **File Import** | Drag & drop or browse — DWG (R14–2018) and DXF files |
| 🖼 **2D Viewer** | High-performance WebGL/Three.js rendering via `@mlightcad/cad-simple-viewer` |
| 📏 **Distance** | Click two points → exact length in mm / cm / m / ft |
| ⬛ **Area** | Trace polygon or tap closed entity → area in selected units |
| 📍 **Coordinates** | Tap any point → live X, Y, Z display with floating tooltip |
| 📐 **Angle** | Pick 3 points → angle in degrees |
| 📄 **Export** | Copy as text, download CSV, or print/save PDF report |
| 🌙 **Dark Mode** | System-aware, persists across sessions |
| 🌐 **i18n** | English and Arabic (RTL) built-in |
| 📴 **Offline** | Service worker caches all assets including WASM workers |
| 🔒 **Privacy** | Zero data leaves your device — no analytics, no telemetry |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) 20 LTS+
- npm (comes with Node)

### Install & Run
```bash
# Clone
git clone https://github.com/YOUR_USERNAME/CADviewer.git
cd CADviewer

# Install dependencies
npm install

# Start dev server
npm run dev
# → open http://localhost:5173
```

### Build for Production
```bash
npm run build
# output → dist/

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
CADviewer/
├── public/
│   ├── manifest.json          ← PWA manifest
│   ├── favicon.svg
│   └── icons/
│       ├── icon-192.svg       ← PWA icon (Add to Home Screen)
│       └── icon-512.svg
├── src/
│   ├── App.vue                ← Root component: file loading, layout
│   ├── main.ts                ← App bootstrap + i18n + SW registration
│   ├── pwa.ts                 ← Service worker registration helper
│   ├── assets/
│   │   └── theme.css          ← CSS variables: light/dark themes
│   ├── components/
│   │   ├── FileDropZone.vue   ← Drag & drop + file input (iPhone-friendly)
│   │   ├── MeasureToolbar.vue ← Mode buttons + unit selector
│   │   ├── MeasureResults.vue ← Collapsible results panel with export
│   │   └── CursorCoord.vue    ← Live floating coordinate tooltip
│   ├── composables/
│   │   ├── useMeasure.ts      ← All measurement logic (distance/area/angle/coord)
│   │   ├── useExport.ts       ← CSV / text / PDF export
│   │   └── useTheme.ts        ← Dark mode toggle with localStorage persist
│   └── i18n/
│       ├── en.ts              ← English strings
│       └── ar.ts              ← Arabic strings (RTL)
├── .github/workflows/
│   └── deploy.yml             ← GitHub Actions → Vercel auto-deploy
├── vercel.json                ← Vercel headers (COOP/COEP for WASM)
├── vite.config.ts             ← Vite + VitePWA + WASM worker copy
├── tsconfig.json
└── package.json
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                Vue 3 Application                     │
│                                                     │
│  FileDropZone → App.vue → MeasureToolbar             │
│                    │         MeasureResults           │
│                    │         CursorCoord              │
│                    │                                 │
│            ┌───────▼────────┐                       │
│            │  useMeasure.ts │  ← distance/area/angle │
│            │  useExport.ts  │  ← CSV/text/PDF        │
│            │  useTheme.ts   │  ← dark/light          │
│            └───────┬────────┘                       │
│                    │                                 │
│    ┌───────────────▼──────────────────┐             │
│    │  @mlightcad/cad-simple-viewer    │             │
│    │  AcApDocManager (Three.js + WASM)│             │
│    └───────────────┬──────────────────┘             │
│                    │                                 │
│    ┌───────────────▼──────────────────┐             │
│    │  @mlightcad/data-model           │             │
│    │  AcDbLine, AcDbCircle,           │             │
│    │  AcDbLwPolyline, AcDbArc…        │             │
│    └──────────────────────────────────┘             │
└─────────────────────────────────────────────────────┘
         ↕ Web Workers (WASM)
   dxf-parser-worker.js
   libredwg-parser-worker.js   ← DWG R14–2018
   mtext-renderer-worker.js
```

---

## 📱 iPhone / iOS Usage

1. Open the app URL in **Safari** on iPhone
2. Tap **Share (↑) → Add to Home Screen**
3. Launch from home screen — runs as full-screen standalone app
4. Works completely **offline** after first load (service worker caches everything)
5. Use **Files.app** to pick `.dwg` or `.dxf` files via the "Browse Files" button

> **Note:** iOS Safari does not support drag-and-drop from the home screen, but the "Browse Files" button opens the native Files.app picker.

---

## 🌐 Deployment

### Vercel (Recommended — Free)
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Settings:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy** — done!

For automatic deploys via GitHub Actions, add these secrets to your repo:
- `VERCEL_TOKEN` — from vercel.com → Account → Tokens
- `VERCEL_ORG_ID` — from `.vercel/project.json` after `vercel link`
- `VERCEL_PROJECT_ID` — same file

### Netlify (Alternative)
```toml
# netlify.toml (create in project root)
[build]
  command = "npm run build"
  publish = "dist"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔧 Configuration

### Changing Drawing Units
By default, 1 drawing unit = 1 mm (AutoCAD standard).
If your drawings use a different base unit, edit `src/composables/useMeasure.ts`:

```typescript
const DRAW_UNIT_TO_MM = 1  // Change to 25.4 for inches, 1000 for meters, etc.
```

### Adding a New Language
1. Copy `src/i18n/en.ts` → `src/i18n/xx.ts`
2. Translate all strings
3. In `src/main.ts`, import and add to the `messages` object

---

## 🤝 Based On

This app is built on top of [mlightcad/cad-viewer](https://github.com/mlightcad/cad-viewer) — a high-performance open-source WebGL DWG/DXF viewer.

- Core rendering: `@mlightcad/cad-simple-viewer`
- Entity model: `@mlightcad/data-model`
- PWA tooling: `vite-plugin-pwa`
- UI framework: Vue 3 + TypeScript
- i18n: vue-i18n

---

## 📝 License

MIT License — see [LICENSE](LICENSE).

Built with ❤️ for engineers, architects, and surveyors who need CAD on the go.
