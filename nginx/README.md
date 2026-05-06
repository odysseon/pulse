# nginx/

Nginx configuration for the CampusPulse reverse proxy. Sits in front of the NestJS app and handles
rate limiting, security headers, compression, upstream load balancing, and connection management.

---

## nginx.conf

The single configuration file for the proxy. Key concerns and how to adjust them:

---

### Rate Limiting

Three distinct rate limit zones are defined to protect different types of endpoints:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=health:10m rate=60r/m;
```

- **`api`**: Standard limits for general traffic (`/api/`) — 10 requests per second.
- **`login`**: Stricter limits to mitigate brute-force attacks (`/api/auth/`) — 5 requests per
  minute.
- **`health`**: Dedicated zone for container orchestrator health checks (`/health`) — 60 requests
  per minute.

**To adjust a limit:** Change the `rate=` value on the relevant `limit_req_zone` line. The `burst`
value on the corresponding `limit_req` directive inside the server block controls how many requests
above the rate can queue before being rejected with a `503` (or custom status).

---

### Upstream Configuration & Load Balancing

```nginx
upstream app_server {
    least_conn;
    server onenigeria_app:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

- **`least_conn`**: Distributes traffic to the container with the fewest active connections.
- **Resilience**: If the upstream fails 3 times within 30 seconds (`max_fails=3 fail_timeout=30s`),
  Nginx will temporarily stop sending requests to it.
- **`keepalive 32`**: Maintains up to 32 persistent connections to the app container. This avoids a
  TCP handshake on every request, which is critical under load.

---

### Security Headers

Five strict security headers are applied to all proxied responses:

| Header                   | Value                                      | Purpose                                               |
| ------------------------ | ------------------------------------------ | ----------------------------------------------------- |
| `X-Frame-Options`        | `SAMEORIGIN`                               | Prevents clickjacking by restricting iframe embedding |
| `X-Content-Type-Options` | `nosniff`                                  | Prevents MIME-type sniffing                           |
| `X-XSS-Protection`       | `1; mode=block`                            | Legacy XSS filter                                     |
| `Referrer-Policy`        | `strict-origin-when-cross-origin`          | Protects referer data across different origins        |
| `Permissions-Policy`     | `geolocation=(), microphone=(), camera=()` | Disables browser access to specific hardware features |

---

### Client Limits & Buffer Tuning

- **Max Body Size:** Configured to `client_max_body_size 20M;` to support moderate file/data
  uploads.
- **JSON API Buffering:** Dedicated `proxy_buffer` settings are tuned specifically for parsing JSON
  responses without dropping to disk.

---

### Timeouts

Proxy timeouts are standardized across all application routes (`/api/`, `/api/auth/`, `/`):

| Directive               | Timeout | Reason                                                   |
| ----------------------- | ------- | -------------------------------------------------------- |
| `proxy_connect_timeout` | 10s     | Time Nginx waits to establish a connection to the app    |
| `proxy_send_timeout`    | 60s     | Time Nginx waits to transmit a request to the app        |
| `proxy_read_timeout`    | 60s     | Time Nginx waits for the app to respond (e.g., heavy DB) |

---

### Gzip Compression

```nginx
gzip on;
gzip_types text/plain application/json image/svg+xml ...;
gzip_comp_level 6;
```

Compression is enabled for a wide array of text-based and API data formats at level 6 (a strong
balance between CPU overhead and compression ratio). Note that `text/html` is intentionally omitted.

**To disable compression** (e.g., for debugging): set `gzip off`.

---

### Network Topology & Real IP

Nginx acts as the gatekeeper. Because traffic passes through a Docker bridge network
(`172.16.0.0/12`), Nginx is configured to extract the actual client IP using `set_real_ip_from` and
the `X-Forwarded-For` header.

Nginx also exposes a stub status endpoint at `/nginx_status`, which is strictly restricted to
`localhost` and internal bridge IPs (`172.16.0.0/12`) to prevent public exposure of server metrics.
