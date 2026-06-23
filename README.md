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
