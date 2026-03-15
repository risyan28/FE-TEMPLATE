# QC Assistant Approval Quotation - Frontend

Frontend template berbasis React Router + SSR, sudah diposisikan sebagai **pnpm-first** untuk development dan deployment.

## Stack

- React Router v7 (SSR)
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Vitest + Playwright
- Express runtime server (`server.js`)

## Package Manager Standard

Project ini menggunakan `pnpm` sebagai standar utama.

- `packageManager` sudah dipin di `package.json`.
- Lockfile utama: `pnpm-lock.yaml`.
- Untuk konsistensi tim/CI/VPS, gunakan pnpm di semua environment.

## Getting Started

### 1) Install Dependencies

```bash
pnpm install
```

Jika command `pnpm` belum tersedia (Windows non-admin), gunakan fallback:

```bash
npx -y pnpm@10.32.1 install
```

### 2) Run Development Server

```bash
pnpm dev
```

App default berjalan di `http://localhost:5173`.

### 3) Type Check

```bash
pnpm typecheck
```

### 4) Test

```bash
pnpm test
pnpm test:run
pnpm test:coverage
```

## Build and Run Production

### Build

```bash
pnpm build
```

### Start SSR Server

```bash
pnpm start
```

Server production berjalan lewat `server.js` dan membaca output build dari folder `build/`.

## Deployment (VPS)

Deploy artifact dari hasil `pnpm build`:

```text
├── package.json
├── pnpm-lock.yaml
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side bundle
└── server.js
```

Alur minimum di VPS:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Disarankan pakai process manager (`systemd` atau `pm2`) untuk auto-restart saat crash/reboot.

## Scripts

- `pnpm dev`: jalankan development server
- `pnpm build`: build client + server bundle
- `pnpm start`: jalankan runtime production (SSR)
- `pnpm typecheck`: generate route types + TypeScript checking
- `pnpm test`: jalankan unit/integration tests (watch)
- `pnpm test:run`: run test sekali (CI mode)
- `pnpm test:coverage`: run tests dengan coverage
- `pnpm check:conflicts`: cek conflict marker pada staged changes
- `pnpm check:conflicts:all`: cek conflict marker pada seluruh repository
- `pnpm hooks:install`: aktifkan repo hooks path ke `.githooks`
- `pnpm bundle:fe`: build frontend bundle script tambahan

## Hardening Stage 2

Template ini sudah dilengkapi baseline quality guard:

- Pre-commit guard conflict marker via `.githooks/pre-commit`.
- Script checker conflict marker di `scripts/check-conflict-markers.mjs`.
- CI workflow minimum di `.github/workflows/ci.yml` untuk:
  - install (`pnpm install --frozen-lockfile`)
  - conflict check (`pnpm run check:conflicts:all`)
  - typecheck (`pnpm run typecheck`)
  - test (`pnpm run test:run`)
  - build (`pnpm run build`)

Aktifkan hooks sekali per clone:

```bash
pnpm run hooks:install
```

## Notes

- Simpan secret production di environment VPS, jangan hardcode ke source code.
- Setelah update dependency, commit perubahan lockfile agar deploy tetap deterministic.
