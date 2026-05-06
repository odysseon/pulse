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

### 2. Local Development

The local stack mounts your source code for hot-reloading and exposes ports for debugging.

**Build and Spin Up (Single Command):**
The most common command. This builds the images (if changes were made to `Dockerfile` or `package.json`) and starts the containers in the background:

```bash
docker compose up -d --build
```

**Step-by-Step Lifecycle:**
If you prefer granular control over the process:

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

### 3. Production Deployment

The production stack uses the minimal `production` build stage, strips dev dependencies, and locks down internal ports.

To deploy, you must pass both the base compose file and the production override file:

**Build and Spin Up (Production):**

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

**Tear Down (Production):**

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### 4. Accessing the Application

Once the stack is running, all traffic flows through the Nginx proxy on port 80:

- **API Root:** `http://localhost/api`
- **Swagger Docs:** `http://localhost/api/docs`
- **Health Check:** `http://localhost/api/health`

---
