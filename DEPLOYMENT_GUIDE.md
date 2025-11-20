# Deployment Guide - Improved Production Ready Setup

This guide documents the production-ready improvements made to the Dockerfiles and application code.

## Summary of Improvements

### Backend Dockerfile (`backend/Dockerfile`)

#### **Security & Best Practices**
- ✅ **Non-root user**: Application runs as `appuser` (non-root) for security
- ✅ **Layer caching**: Dependencies installed separately before code copy for faster builds
- ✅ **Health checks**: Docker HEALTHCHECK configured for orchestration platforms
- ✅ **Explicit dependency installation**: Uncommented and optimized package installation with `npm ci`
- ✅ **Cache cleanup**: npm cache cleared after installation to reduce image size
- ✅ **Build arguments**: `NODE_ENV` configurable at build time

#### **Key Features**
- Alpine Linux for minimal image size
- Proper port exposure (5005)
- Environment-aware setup
- Permission management for app directory

---

### Frontend Dockerfile (`frontend/ai-copilot-editor/Dockerfile`)

#### **Optimizations**
- ✅ **Multi-stage build**: Optimized build stage + production nginx stage
- ✅ **Build arguments**: `REACT_APP_API_URL` configurable for different environments
- ✅ **Nginx optimization**: Proper directory permissions and ownership
- ✅ **Health checks**: Wget-based health check for nginx
- ✅ **Security**: Non-root nginx user context

#### **Key Features**
- Minimal production image (nginx only, no Node.js)
- SPA routing support via nginx configuration
- Environment-aware API URL configuration
- Security headers supported via nginx.conf

---

### Backend Server (`backend/server.js`)

#### **Production Features**

**Security**
- ✅ **Helmet.js**: Sets secure HTTP headers
- ✅ **CORS**: Configurable origin with credentials support
- ✅ **Request size limits**: Configurable via `MAX_REQUEST_SIZE` env var
- ✅ **Input validation**: Comprehensive validation middleware

**Logging & Observability**
- ✅ **Structured logging**: JSON format logs with timestamps
- ✅ **Request logging**: Logs method, path, status, and duration
- ✅ **Error tracking**: Full error context with stack traces
- ✅ **Environment awareness**: Different output for dev vs production

**Reliability**
- ✅ **Graceful shutdown**: Handles SIGTERM/SIGINT signals
- ✅ **Request timeout**: Configurable via `REQUEST_TIMEOUT` env var
- ✅ **Error handling**: Global error handlers for uncaught exceptions and promise rejections
- ✅ **Compression**: gzip compression for responses

**Endpoints**
- `/health` - Basic health check (status, uptime, environment)
- `/ready` - Readiness probe for orchestration
- `/api/make-shorter` - With full validation and error handling
- `/api/make-longer` - With full validation and error handling

---

## Environment Variables

### Backend Environment Variables

```bash
# Server configuration
PORT=5005                          # Port to listen on (default: 5005)
NODE_ENV=production               # Environment mode (default: development)
REQUEST_TIMEOUT=30000             # Request timeout in ms (default: 30000)
MAX_REQUEST_SIZE=10mb             # Max request body size (default: 10mb)
CORS_ORIGIN=*                     # CORS origin (default: *)
```

### Frontend Build Arguments

```bash
# Build-time configuration
REACT_APP_API_URL=http://api:5005 # Backend API URL
```

---

## Docker Build Commands

### Backend
```bash
# Build with default settings
docker build -f backend/Dockerfile -t ai-copilot-backend:1.0.0 .

# Build with production settings
docker build \
  --build-arg NODE_ENV=production \
  -f backend/Dockerfile \
  -t ai-copilot-backend:1.0.0 \
  .
```

### Frontend
```bash
# Build with custom API URL
docker build \
  --build-arg REACT_APP_API_URL=https://api.example.com \
  -f frontend/ai-copilot-editor/Dockerfile \
  -t ai-copilot-frontend:1.0.0 \
  .
```

---

## Docker Compose Example

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
      args:
        NODE_ENV: production
    environment:
      PORT: 5005
      NODE_ENV: production
      CORS_ORIGIN: http://localhost:3000
      REQUEST_TIMEOUT: 30000
    ports:
      - "5005:5005"
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5005/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    restart: unless-stopped
    networks:
      - app-network

  frontend:
    build:
      context: .
      dockerfile: frontend/ai-copilot-editor/Dockerfile
      args:
        REACT_APP_API_URL: http://backend:5005
    ports:
      - "3000:3000"
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

---

## Kubernetes Deployment Example

### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-copilot-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ai-copilot-backend
  template:
    metadata:
      labels:
        app: ai-copilot-backend
    spec:
      containers:
      - name: backend
        image: ai-copilot-backend:1.0.0
        ports:
        - containerPort: 5005
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5005"
        - name: CORS_ORIGIN
          value: "http://frontend"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5005
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 5005
          initialDelaySeconds: 5
          periodSeconds: 10
```

---

## Security Best Practices Implemented

1. **Non-root User Execution**: Both containers run as non-root users
2. **Security Headers**: Helmet.js adds security headers to HTTP responses
3. **Input Validation**: All API inputs validated for type and content
4. **CORS Configuration**: Configurable CORS origin to prevent unauthorized access
5. **Request Size Limits**: Prevents DoS attacks via oversized payloads
6. **Request Timeouts**: Prevents hanging connections
7. **Error Message Sanitization**: Production mode hides internal errors
8. **Health Checks**: Automated health monitoring for orchestration
9. **Graceful Shutdown**: Allows in-flight requests to complete before shutdown
10. **Compression**: Reduces bandwidth usage

---

## Performance Optimizations

1. **Layer Caching**: Dependencies installed before code copy speeds up rebuild
2. **Minimal Base Image**: Alpine Linux reduces image size
3. **Multi-stage Build**: Frontend production image contains only nginx, not Node.js
4. **Compression Middleware**: gzip compression for all responses
5. **Structured Logging**: JSON logs for efficient log aggregation
6. **Request Duration Tracking**: Identifies slow endpoints

---

## Monitoring & Observability

### Available Endpoints
- `GET /health` - Health status with uptime
- `GET /ready` - Readiness status for orchestration
- Docker health checks configured for both services
- Structured JSON logging for log aggregation (ELK, Splunk, etc.)
- Request duration tracking in logs

### Log Format
```json
{
  "timestamp": "2025-11-19T10:30:45.123Z",
  "level": "INFO",
  "message": "Request completed",
  "method": "POST",
  "path": "/api/make-shorter",
  "status": 200,
  "duration": "45ms",
  "env": "production"
}
```

---

## Deployment Checklist

- [ ] Review and update environment variables for your environment
- [ ] Update `REACT_APP_API_URL` to match your backend URL
- [ ] Update `CORS_ORIGIN` to match your frontend URL
- [ ] Set `NODE_ENV=production` in production
- [ ] Configure appropriate resource limits (CPU, memory)
- [ ] Set up log aggregation/monitoring
- [ ] Configure SSL/TLS at the load balancer level
- [ ] Set up automated health checks
- [ ] Configure auto-scaling policies (if using Kubernetes)
- [ ] Test graceful shutdown handling
- [ ] Verify security headers are being sent
- [ ] Test error handling with invalid inputs

---

## Troubleshooting

### Health Check Failing
- Ensure the container has proper networking
- Check if the application is listening on the correct port
- Verify port mapping in Docker/Kubernetes configuration

### High Memory Usage
- Check for memory leaks using Node.js profiling
- Adjust `MAX_REQUEST_SIZE` if receiving large payloads
- Monitor with `docker stats` or Kubernetes metrics

### Slow Requests
- Check request duration logs
- Verify database/external service performance
- Review CORS origin configuration

---

## Additional Resources

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

