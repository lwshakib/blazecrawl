# Contributing to BlazeCrawl

Thank you for your interest in contributing! This document provides instructions for setting up your development environment, cloning, installing, and running the project services locally.

## Project Architecture & Structure

BlazeCrawl is structured as a monorepo powered by `pnpm` and `turborepo`:

- `apps/web`: Next.js web application dashboard.
- `apps/server`: Express backend scraper API pool.
- `packages/ui`: Shared React component libraries and design tokens.
- `packages/typescript-config` / `eslint-config`: Project linting and build standards.

---

## Getting Started

### 1. Fork the Repository

First, fork the BlazeCrawl repository to your personal GitHub account.

### 2. Clone the Codebase

Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/blazecrawl.git
cd blazecrawl
```

### 3. Install Dependencies

This project uses `pnpm` workspace structure. Make sure you have `pnpm` version `9.15.9` or higher installed:

```bash
pnpm install
```

---

## Local Development Setup

To run the full workspace dashboard, you need the following background services running:

1.  **PostgreSQL**: Configured with a `scrape_runs` history table (created automatically upon connection).
2.  **Redis**: For scrape caching.

### Environment Configuration

Create a `.env` file inside `apps/server/` or copy the database keys. The server connects using:

- `DATABASE_URL` (PostgreSQL connection string)
- `REDIS_URL` (Redis connection string)

### Running Services

To run the web application dashboard and backend scraper concurrently, execute:

```bash
pnpm dev
```

This runs both the server API and web dev servers under `turbo`.

---

## Code Quality Standards

Before committing your changes, make sure your code passes format checks, type verification, and linting rules.

### Formatting Check

To run Prettier checks across all files:

```bash
pnpm format:check
```

### Lint Checks

To run the linter and highlight issues:

```bash
pnpm lint
```

### Build Checks

To verify that everything compiles correctly:

```bash
pnpm build
```

---

## Submitting Pull Requests

1.  Create a branch for your bug fix or feature: `git checkout -b feat/your-feature-name`
2.  Commit your modifications with descriptive logs.
3.  Ensure formatting (`pnpm format:check`) and lints (`pnpm lint`) pass.
4.  Push your changes and open a Pull Request against the `main` branch.
5.  Refer to the pull request template checklist to verify all standards are met.
