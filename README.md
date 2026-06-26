# Cookest Admin Panel

🍳 Next.js dashboard for managing your Cookest self-hosted or cloud instance.

This panel allows administrators to manage users, import databases/datasets, check AI health and token counts, verify system resources, and manage subscriptions.

---

## Core Features

- **Dashboard Home**: Summary of active users, total recipes, and status of connected services.
- **User Management**: View, search, and edit registered users. Grant or revoke admin privileges.
- **Database & Imports**: Scan directories for recipe/ingredient datasets (CSV/JSON) and import them with keyword-based classification and prep time estimators.
- **Ingredients & Recipes**: Direct catalog viewer and manager.
- **AI Diagnostics**: Monitor local Ollama model states, RAG details, and connection status.
- **System Monitoring**: View real-time CPU/RAM usage, Docker container states, and backend server logs.
- **Subscription Management**: Override and review active subscriber tiers.

---

## Configuration

The admin panel uses the following environment variables:

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_API_URL` | `http://localhost:8080` | Endpoint for browser-side API requests. |
| `APP_API_INTERNAL_URL` | `http://localhost:8080` | Endpoint for Server-Side Rendering (SSR) API requests (internal network). |

---

## Self-Hosted First-Run Setup

When running as part of a self-hosted instance (i.e. the backend has `SELF_HOSTED=true`),
the admin panel handles first-run automatically:

1. `cookest init` — collects admin credentials and generates the Docker Compose stack
2. `cookest up` — starts all services and provisions the admin account via `POST /admin/setup`
3. Open the admin panel URL — you are redirected straight to `/dashboard` (login if needed)

If `cookest up` could not reach the API during startup, the admin panel will detect that
no admin exists (`GET /admin/setup/status` returns `needs_setup: true`) and redirect to
`/setup` where you can complete setup manually.

The setup endpoint is disabled (`403 Forbidden`) on non-self-hosted deployments.

---

## Getting Started

### Prerequisites

- **Bun** runtime (v1.0+) or **Node.js** (v22+)

### Local Development

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run the development server:
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Run unit/integration tests:
   ```bash
   bun run test
   ```

### Production Build

1. Build the optimized Next.js bundle:
   ```bash
   bun run build
   ```

2. Start the runner:
   ```bash
   bun run start
   ```

---

## Docker Image

A pre-built image is published to GHCR on every push to `main`:

```
ghcr.io/cookest/admin:latest
```

This is pulled automatically when you run `cookest up`.

### Building from Source

```bash
# Using the Cookest CLI (recommended — also builds the backend images)
cookest build

# Or manually
docker build -t cookest/admin:local .
```

Then use `cookest init --from-source` (or set `[images] source = "local"` in `cookest.toml`)
to make the stack use your locally built image.

## Docker Deployment

Build the container image:

```bash
docker build -t cookest-admin .
```

Run the container:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_APP_API_URL=http://localhost:8080 \
  -e APP_API_INTERNAL_URL=http://localhost:8080 \
  cookest-admin
```
