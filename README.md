# Peersview Next.js

The Talent Discovery Network — Next.js 15 (App Router) + Tailwind v4 + MongoDB + NextAuth v5.

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4
- **DB:** MongoDB + Mongoose
- **Auth:** NextAuth v5 (Credentials, JWT sessions, bcryptjs)
- **Forms:** React Hook Form + Zod (shared schemas, client + server)
- **Package manager:** pnpm
- **Deployment:** Docker (`output: "standalone"`)

## Architecture

```
React Server Component / Server Action
            ↓
        Service Layer (services/)
            ↓
       Mongoose Models (models/)
            ↓
            MongoDB
```

The **service layer** is the single source of truth for data access. Server actions (`app/actions/`) re-validate input via shared Zod schemas (`schemas/`) and call into services — never models directly. See `.cursor/rules/` for enforceable conventions.

## Folder Structure

```
app/
  actions/        # Server actions
  api/            # Route handlers (NextAuth)
  jobs/           # Job pages
  sign-in/, sign-up/
components/
  landing/        # Landing page sections
  jobs/           # Job-related components
  auth/           # Auth forms
lib/              # db.ts, auth.ts
models/           # Mongoose schemas
schemas/          # Zod schemas (shared FE + BE)
services/         # Service layer (single DB access path)
types/            # Shared TS types
```

## Local Development

```bash
pnpm install
cp .env.example .env.local      # set MONGODB_URI + AUTH_SECRET
pnpm dev
```

Generate an `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Docker (VPS Deployment)

The Dockerfile uses a multi-stage build with pnpm and Next.js standalone output.

### Build & run with Docker Compose (includes MongoDB)

```bash
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env
docker compose up -d --build
```

App listens on `http://your-vps:3000`. MongoDB persists in the `mongo_data` volume.

### Build & run the image alone

```bash
docker build -t peersview-nextjs .
docker run -p 3000:3000 \
  -e MONGODB_URI="mongodb://your-host/peersview" \
  -e AUTH_SECRET="..." \
  -e AUTH_TRUST_HOST=true \
  peersview-nextjs
```

### Behind a reverse proxy on a VPS

Set in your environment:

```
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://your-domain.com
```

Then point Nginx / Caddy / Traefik at `localhost:3000`.

## Scripts

| Command       | Action                          |
| ------------- | ------------------------------- |
| `pnpm dev`    | Start dev server with Turbopack |
| `pnpm build`  | Production build (standalone)   |
| `pnpm start`  | Run the production build        |
| `pnpm lint`   | Run ESLint                      |
