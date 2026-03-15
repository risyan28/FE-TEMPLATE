# Project Blueprint - QC Assistant Approval Quotation

Dokumen ini jadi acuan kerangka pengembangan project ke depan.
Fokus: modern React Router template untuk dashboard/SPA dengan SSR, telemetry, socket realtime, dan toolchain lengkap untuk development + testing.

## 1. Tujuan Project

- Nama resmi project: **QC Assistant Approval Quotation**.
- Membangun aplikasi frontend dashboard untuk kebutuhan operasional QC/manufacturing.
- Mendukung rendering SSR untuk performa awal dan SEO/compatibility.
- Menyediakan arsitektur yang siap scale: modular, testable, observability-ready.
- Menyediakan baseline engineering workflow yang konsisten untuk tim.

## 1.1 Standar Package Manager

- Package manager utama yang direkomendasikan: **pnpm**.
- Alasan pemilihan:
  - Instalasi dependency lebih cepat dan hemat disk dibanding npm/yarn classic.
  - Lockfile deterministik (`pnpm-lock.yaml`) cocok untuk server VPS dan CI/CD.
  - Sudah mature untuk ekosistem React/Vite/TypeScript.
- Untuk local development dan VPS, gunakan Corepack agar versi package manager konsisten.
- Seluruh workflow command default sudah menggunakan pnpm.

## 2. Arsitektur Tingkat Tinggi

- Runtime: React Router v7 + React 19.
- Rendering: SSR via Node/Express (`server.js`) + hydration di client.
- Build tool: Vite + React Router build pipeline.
- Styling: Tailwind CSS v4 + komponen UI reusable.
- Data layer:
  - HTTP via `axios` (wrapper di `app/lib/api.ts`).
  - Caching/fetch state via TanStack Query.
- Realtime layer: `socket.io-client` (wrapper/hook di `app/lib/socket.ts` dan `app/hooks/*socket*`).
- Observability:
  - Error tracking via Sentry (`app/lib/sentry.ts`).
  - Telemetry/OpenTelemetry (`app/lib/telemetry.ts`).
- Quality gates:
  - Unit/integration test via Vitest + Testing Library.
  - E2E test via Playwright.

## 3. Struktur Project (Aktual)

```text
.
├── app/
│   ├── app.css
│   ├── globals.css
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── root.tsx
│   ├── routes.ts
│   ├── components/
│   │   ├── app-header.tsx
│   │   ├── app-sidebar.tsx
│   │   ├── loading-screen.tsx
│   │   ├── loading-skeleton.tsx
│   │   ├── login-form.tsx
│   │   ├── nav-main.tsx
│   │   ├── nav-projects.tsx
│   │   ├── nav-user.tsx
│   │   ├── site-header.tsx
│   │   ├── team-switcher.tsx
│   │   └── ui/
│   │       ├── advanced-data-table.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── collapsible.tsx
│   │       ├── data-table.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── sonner.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       └── tooltip.tsx
│   ├── hooks/
│   │   ├── use-example-socket.ts
│   │   ├── use-mobile.ts
│   │   ├── use-socket-status.ts
│   │   ├── useLogin.ts
│   │   └── useMenuItems.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── error-handler.ts
│   │   ├── logger.ts
│   │   ├── notifications.ts
│   │   ├── query-client.ts
│   │   ├── sentry.ts
│   │   ├── socket.ts
│   │   ├── telemetry.ts
│   │   ├── utils.ts
│   │   └── validation.ts
│   ├── login/
│   │   └── index.tsx
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   └── dashboard/
│   │       └── index.tsx
│   ├── services/
│   │   └── exampleApi.ts
│   └── types/
│       └── example.ts
├── public/
│   └── manifest.json
├── scripts/
│   └── build-frontend-bundle.mjs
├── tests/
│   ├── playwright.config.ts
│   ├── vitest.config.ts
│   └── vitest.setup.ts
├── components.json
├── package.json
├── react-router.config.ts
├── README.md
├── server.js
├── tsconfig.json
├── vite-env.d.ts
└── vite.config.ts
```

## 4. Mapping Tanggung Jawab Folder

- `app/routes/`: halaman route-level (entry utama halaman).
- `app/components/`: komponen presentational dan layout.
- `app/components/ui/`: komponen UI reusable (design primitives).
- `app/hooks/`: custom hooks untuk logic lintas komponen.
- `app/lib/`: infrastruktur aplikasi (API client, auth, telemetry, socket, error handling).
- `app/services/`: adaptor business use case per domain API.
- `app/types/`: type contract domain.
- `public/`: asset statis dan PWA metadata (`manifest.json`).
- `tests/`: konfigurasi dan setup test.
- `scripts/`: utilitas build/deployment tambahan.

## 5. Konvensi Coding yang Dipakai

### 5.1 Routing

- Definisi route terpusat di `app/routes.ts`.
- Satu route file = satu concern halaman.
- Gunakan nested route folder untuk modul besar (contoh: `dashboard/`).

### 5.2 Component Design

- Komponen domain/fitur di `app/components/`.
- Primitive UI di `app/components/ui/`.
- Hindari business logic berat di komponen presentational.

### 5.3 Data Fetching

- Semua request HTTP lewat wrapper `app/lib/api.ts`.
- Query/mutation state via TanStack Query.
- Validasi response idealnya melalui schema (`zod`) sebelum dipakai UI.

### 5.4 Error Handling

- Error API dinormalisasi di `app/lib/error-handler.ts`.
- User feedback melalui notification/toast (`app/lib/notifications.ts`).
- Error kritis dikirim ke Sentry.

### 5.5 Realtime Socket

- Inisialisasi socket terpusat di `app/lib/socket.ts`.
- Konsumsi event via hooks (`use-example-socket`, `use-socket-status`).
- Setiap event wajib punya cleanup listener saat unmount.

### 5.6 Telemetry dan Logging

- Telemetry event dikirim dari layer `app/lib/telemetry.ts`.
- Logging dibedakan level: debug/info/warn/error via `app/lib/logger.ts`.
- Jangan log data sensitif (token/password/PII).

## 6. Standar Environment Variables

Contoh baseline variabel yang direkomendasikan:

```env
# API
VITE_API_BASE_URL=http://localhost:3000/api

# Socket
VITE_SOCKET_URL=http://localhost:3000

# Observability
VITE_SENTRY_DSN=
VITE_OTEL_ENDPOINT=

# App
VITE_APP_ENV=development
VITE_APP_VERSION=0.1.0
```

Catatan:

- Semua variabel client-side harus prefix `VITE_`.
- Simpan secret server-only di environment server, bukan di bundle client.

## 7. Workflow Development

### 7.1 Instalasi

```bash
pnpm install
```

### 7.2 Menjalankan Development Server

```bash
pnpm dev
```

### 7.3 Type Checking

```bash
pnpm typecheck
```

### 7.4 Testing

```bash
pnpm test
pnpm test:run
pnpm test:coverage
```

### 7.5 Build Production

```bash
pnpm build
pnpm start
```

Output deploy utama berada di folder `build/`:

- `build/client`: asset statis.
- `build/server`: SSR server bundle.

## 8. Strategi Testing

- Unit test:
  - Utility functions di `app/lib/*`.
  - Custom hooks di `app/hooks/*`.
- Component test:
  - Interaksi form, loading state, error state.
- Integration test:
  - Page + data loading + mutation flow.
- E2E test:
  - Login flow, dashboard flow, critical user journey.

## 9. Strategi Deploy

- Build artifact wajib dari `pnpm build`.
- Jalankan server production via `pnpm start`.
- Untuk environment container/cloud, pastikan:
  - `NODE_ENV=production`.
  - Port binding sesuai platform.
  - Static asset cache policy aktif pada reverse proxy/CDN.
- Untuk VPS, gunakan service manager (systemd/pm2) agar proses SSR auto-restart saat crash/reboot.

## 10. Backlog Struktur yang Disarankan (Next Step)

- Tambah folder feature modular untuk domain besar:

```text
app/
  features/
    auth/
      components/
      hooks/
      services/
      types/
    dashboard/
      components/
      hooks/
      services/
      types/
```

- Tambah `app/constants/` untuk konstanta lintas modul.
- Tambah `app/config/` untuk parser environment yang typed.
- Tambah `tests/e2e/` untuk skenario Playwright terstruktur.

## 11. Definition of Done (DoD) Tim

Satu task dianggap selesai jika:

- Route/fitur berjalan normal di SSR dan client navigation.
- Typecheck lulus.
- Test yang relevan lulus.
- Error handling dan empty/loading state tersedia.
- Telemetry event penting sudah dipasang (jika fitur kritikal).
- Tidak ada hardcoded secret/credential di source.

## 12. Catatan Audit Template (Current State)

- Dokumentasi utama (`README.md`) sudah distandardisasi pnpm-first.
- Package manager project sudah dipin di `package.json` (`packageManager`) untuk konsistensi lintas dev/CI/VPS.
- Script helper Git sudah dipisah ke file Node (`scripts/git-solo.mjs`, `scripts/git-team.mjs`) untuk mengurangi issue lintas shell.
- Hardening stage 2 sudah diterapkan:
  - Pre-commit guard untuk conflict marker via `.githooks/pre-commit`.
  - Script pemeriksa conflict marker di `scripts/check-conflict-markers.mjs`.
  - CI minimum di `.github/workflows/ci.yml` (install, conflict-check, typecheck, test:run, build).
- Next hardening yang direkomendasikan:
  - Tambahkan lint gate (`eslint`) ke pipeline CI.
  - Tambahkan smoke test e2e minimal untuk jalur login + dashboard.
  - Sediakan aset PWA final (icon PNG + screenshot real) sebelum go-live.

---

Dokumen ini adalah baseline. Jika arsitektur berubah, update dokumen ini bersamaan dengan perubahan implementasi agar tetap sinkron.
