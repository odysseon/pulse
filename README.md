# Pulse Backend

Pulse helps businesses and individuals become discoverable through digital storefronts, structured
listings, and trust-first commercial visibility.

> Discovery-first commercial infrastructure.

## Overview

Pulse is designed to help businesses and individuals become discoverable.

The backend provides the foundation for:

- Identity
- Business Profiles
- Storefronts
- Listings
- Categories
- Discovery

It intentionally avoids becoming an ERP or ecommerce platform in its initial stages.

---

## Product Philosophy

Pulse is not trying to own commerce.

Pulse helps people connect for commerce.

Typical flow:

```
Business
      ↓

Create Profile
      ↓

Launch Storefront
      ↓

Publish Listings
      ↓

Become Discoverable
      ↓

Customer Makes Contact
```

Transactions happen outside the platform unless future product direction changes.

---

## Core Domain

```
Account
    ↓

User
    ↓

Business Profile
    ↓

Listings
```

Business Profiles represent commercial identities.

Listings represent commercial offerings.

Listings may represent:

- Products
- Services
- Opportunities

The system intentionally avoids industry-specific models.

There are no:

- CarDealer
- PhoneSeller
- LogisticsCompany
- EventCentre

Business is business.

Categories and listings provide specialization.

---

## Backend Design Principles

- Composition over specialization
- Keep the schema generic
- Prefer explicit domain boundaries
- Resource-specific endpoints
- Avoid premature abstraction
- Build for discoverability first

---

## Media Philosophy

Media uploads are resource-specific.

Examples:

```
POST /users/me/avatar

POST /business-profiles/:id/logo

POST /business-profiles/:id/banner

POST /listings/:id/cover

POST /listings/:id/gallery
```

The server determines:

- destination
- ownership
- permissions
- constraints

Clients should never choose storage destinations.

---

## Layering

Transport DTOs are not domain models.

Internal types are not API responses.

Recommended separation:

```
HTTP DTOs
        ↓

Use Cases

        ↓

Domain Types

        ↓

Persistence

        ↓

Database
```

Each layer owns its own contracts.

Types should not leak across boundaries.

---

## Current MVP

Wave 1 includes:

- Authentication
- User profile
- Business profile
- Storefront creation
- Listing management
- Categories
- Discovery
- Search

Deferred:

- Payments
- Orders
- Checkout
- Messaging
- Logistics execution
- Recommendations

---

## Development Principle

The backend should continuously optimize for one question:

> Can a real business create a storefront and become discoverable?

Every new feature should justify itself against that objective.

Complexity should only be introduced when required by demonstrated product needs.

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

The production stack uses the minimal `production` build stage, strips dev dependencies, and locks
down internal ports. To deploy, pass both the base compose file and the production override:

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

Because the Nginx proxy is configured with `least_conn` load balancing, you can scale the backend
horizontally with a single command:

```bash
# Creates N identical backend containers; Nginx automatically
# distributes traffic across them via the internal network.
docker compose up -d --scale backend=3
```

**Why this works:**

- **Port Reset:** The production override resets host port bindings, so multiple containers can all
  listen on port `3000` internally without conflict.
- **Automatic Failover:** If an instance crashes, Nginx marks it as down for 30s (`max_fails=3`) and
  routes traffic to the healthy ones.

---

### 5. Accessing the Application

Once the stack is running, all traffic flows through the Nginx proxy on port `80`:

| Endpoint     | URL                         |
| ------------ | --------------------------- |
| API Root     | `http://localhost/api`      |
| Swagger Docs | `http://localhost/api/docs` |
| Health Check | `http://localhost/health`   |

> **Note:** The health check lives at `/health`, not `/api/health` — it's served directly by Nginx
> (bypassing the API prefix) as defined in `nginx.conf`.

---
