# Reasonix Workspace Collaboration Platform

Time-boxed full-stack assignment built as a Turbo monorepo with a NestJS API, a Next.js frontend, PostgreSQL via Prisma, and Redis in Docker.

## What is shipped

- Simple multi-tenant workspace dashboard in Next.js.
- CRUD flow for workspaces, boards, lists, and cards.
- Tenant scoping at the board layer through the `x-workspace-id` request header.
- PostgreSQL schema managed with Prisma migrations.
- Docker Compose for local infrastructure.
- One-command local startup for infra plus both app dev servers.

## Tech stack

- Frontend: Next.js, React, Tailwind CSS, Axios
- Backend: NestJS, Prisma, PostgreSQL
- Infrastructure: Redis, Docker Compose, Turborepo

## One-command startup

Prerequisites:

- Node.js 18+
- npm 11+
- Docker Desktop running

Install dependencies once:

```bash
npm install
```

Start everything with a single command:

```bash
npm run start:all
```

What this command does:

1. Starts PostgreSQL and Redis with Docker.
2. Waits until both services are reachable.
3. Applies Prisma migrations.
4. Starts the API and web app through Turbo.

Local URLs:

- Web: http://localhost:3001
- API: http://localhost:8000
- Postgres: localhost:5432
- Redis: localhost:6379

Stop the Docker infrastructure when finished:

```bash
npm run infra:down
```

## Project structure

```text
apps/
  api/   NestJS + Prisma backend
  web/   Next.js frontend
packages/
  eslint-config/
  typescript-config/
  ui/
```

## Architecture notes

### Multi-tenancy

The data model uses `Workspace` as the tenant boundary. Boards belong to a workspace, lists belong to a board, and cards belong to a list. The frontend selects a workspace and passes `x-workspace-id` when fetching or creating boards so workspace data stays partitioned.

### Backend shape

The backend is intentionally simple: controllers expose CRUD endpoints and services perform Prisma operations. That keeps the domain easy to follow in a short assignment window.

### Frontend shape

The frontend is a single dashboard that lets you move top-down through the model:

1. Pick or create a workspace.
2. Create boards inside that workspace.
3. Open a board and manage lists.
4. Add cards inside each list.

The UI is deliberately simple and functional rather than polished.

## Data model

Core models:

- `User`
- `Workspace`
- `Membership`
- `Board`
- `List`
- `Card`

This gives a straightforward structure for isolating tenant data and expanding into permissions later.

## Trade-offs

- I kept the UI intentionally simple to maximize working end-to-end behavior within the time box.
- Authentication was left out, which matches the assignment guidance.
- Redis is provisioned in Docker, but the current application code does not yet use it for a production-grade cache, queue, or pub/sub flow.
- The current repo focuses on clean CRUD and tenant-aware structure first rather than a broader feature set.

## Useful commands

```bash
npm run start:all
npm run dev
npm run build
npm run check-types
npm run infra:up
npm run infra:down
npm run db:migrate
```

## Submission notes

This project was approached as a time-boxed exercise. The goal was to deliver a maintainable baseline with clear module boundaries, a working frontend, and a reproducible local setup instead of over-optimizing for feature count.
