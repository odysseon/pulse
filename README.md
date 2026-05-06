## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [pnpm](https://pnpm.io/) (Recommended for local tooling)

### 1. Environment Setup

Clone the repository and set up your environment variables:

```bash
git clone https://github.com/phastboy/campuspulse.git
cd pulse
cp .env.example .env
```

_Be sure to edit `.env` with your desired database credentials before proceeding._

---

### 2. Local Development

The local stack mounts your source code for hot-reloading and exposes ports for debugging.

**Build and Spin Up (Single Command):**

```bash
docker compose up -d --build
```

**Step-by-Step Lifecycle:**

```bash
# 1. Build the images without starting them
docker compose build

# 2. Spin up the containers
docker compose up -d

# 3. View the logs (follow mode)
docker compose logs -f

# 4. Tear down the stack
docker compose down
```

---

### 3. Production Deployment

The production stack uses the minimal `production` build stage, strips dev dependencies, and locks down internal ports. To deploy, pass both the base compose file and the production override:

**Build and Spin Up:**

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

**Tear Down:**

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

---

### 4. Scaling & Resilience

Because the Nginx proxy is configured with `least_conn` load balancing, you can scale the backend horizontally with a single command:

```bash
# Creates N identical backend containers; Nginx automatically
# distributes traffic across them via the internal network.
docker compose up -d --scale backend=3
```

**Why this works:**

- **Port Reset:** The production override resets host port bindings, so multiple containers can all listen on port `3000` internally without conflict.
- **Automatic Failover:** If an instance crashes, Nginx marks it as down for 30s (`max_fails=3`) and routes traffic to the healthy ones.

---

### 5. Accessing the Application

Once the stack is running, all traffic flows through the Nginx proxy on port `80`:

| Endpoint     | URL                         |
| ------------ | --------------------------- |
| API Root     | `http://localhost/api`      |
| Swagger Docs | `http://localhost/api/docs` |
| Health Check | `http://localhost/health`   |

> **Note:** The health check lives at `/health`, not `/api/health` — it's served directly by Nginx (bypassing the API prefix) as defined in `nginx.conf`.

---
