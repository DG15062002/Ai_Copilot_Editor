# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for local development)

---

## Option 1: Docker Compose (Recommended)

### 1. Build & Start Services
```bash
cd /Users/dgupta/research_project/Ai_Copilot_Editor
docker-compose up --build
```

### 2. Access Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5005
- **Health Check**: http://localhost:5005/health

### 3. Test Endpoints
```bash
# Make text shorter
curl -X POST http://localhost:5005/api/make-shorter \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a very long text that needs to be shortened"}'

# Make text longer
curl -X POST http://localhost:5005/api/make-longer \
  -H "Content-Type: application/json" \
  -d '{"text": "Short text"}'

# Check health
curl http://localhost:5005/health
```

### 4. Stop Services
```bash
docker-compose down
```

---

## Option 2: Build Individual Containers

### Backend Only
```bash
# Build
docker build -f backend/Dockerfile -t backend:latest .

# Run
docker run -p 5005:5005 \
  -e NODE_ENV=development \
  -e PORT=5005 \
  backend:latest
```

### Frontend Only
```bash
# Build
docker build \
  -f frontend/ai-copilot-editor/Dockerfile \
  --build-arg REACT_APP_API_URL=http://localhost:5005 \
  -t frontend:latest .

# Run
docker run -p 3000:3000 frontend:latest
```

---

## Option 3: Local Development

### Backend
```bash
# Install dependencies
cd backend
npm install

# Add required packages if not present
npm install express body-parser cors compression helmet

# Start server
npm start

# Or use nodemon for auto-reload
npm install --save-dev nodemon
npm run dev
```

### Frontend
```bash
# Install dependencies
cd frontend/ai-copilot-editor
npm install

# Start dev server
npm start

# Build for production
npm run build
```

---

## Environment Variables

### Backend (server.js)
```bash
NODE_ENV=production        # Set to 'production' for prod
PORT=5005                  # Port to listen on
CORS_ORIGIN=*              # CORS origin (e.g., http://localhost:3000)
REQUEST_TIMEOUT=30000      # Request timeout in ms
MAX_REQUEST_SIZE=10mb      # Max request body size
```

### Frontend (build-time)
```bash
REACT_APP_API_URL=http://localhost:5005  # Backend API URL
```

---

## Common Commands

### Docker Compose
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild images
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove everything (including volumes)
docker-compose down -v

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# View service status
docker-compose ps
```

### Docker
```bash
# Build image
docker build -t backend:latest -f backend/Dockerfile .

# Run container
docker run -p 5005:5005 backend:latest

# View logs
docker logs <container-id>

# Stop container
docker stop <container-id>

# View container processes
docker ps
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # for frontend
lsof -i :5005  # for backend

# Kill process
kill -9 <PID>

# Or use different ports
docker run -p 8080:3000 frontend:latest
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild without cache
docker-compose up --build --no-cache
```

### API Connection Issues
- Check backend is running: `curl http://localhost:5005/health`
- Verify CORS_ORIGIN environment variable
- Check REACT_APP_API_URL matches backend address

### Dependencies Not Installing
```bash
# Clear cache and reinstall
docker-compose down -v
docker-compose up --build --no-cache
```

---

## Testing

### Test Backend API
```bash
# Valid request
curl -X POST http://localhost:5005/api/make-shorter \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'

# Invalid request (missing text)
curl -X POST http://localhost:5005/api/make-shorter \
  -H "Content-Type: application/json" \
  -d '{}'

# Check health
curl http://localhost:5005/health

# Check readiness
curl http://localhost:5005/ready
```

### View Logs
```bash
# Backend logs (JSON structured)
docker-compose logs backend

# Real-time logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

---

## Performance

### Check Resource Usage
```bash
# Docker stats
docker stats

# In docker-compose
docker-compose stats
```

### Optimize Builds
- Uses layer caching (dependencies cached separately)
- Alpine Linux for smaller images
- Multi-stage builds for frontend

---

## Security

### Check Security Headers
```bash
curl -I http://localhost:5005/health
```

Expected headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Verify Health Checks
```bash
# Backend health
curl http://localhost:5005/health

# Frontend health
curl http://localhost:3000/
```

---

## Next Steps

1. ✅ Run `docker-compose up --build`
2. ✅ Test endpoints with curl
3. ✅ Check logs with `docker-compose logs`
4. ✅ Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed info
5. ✅ Deploy to your chosen platform

---

## Platform-Specific Guides

### AWS ECS
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#kubernetes-deployment-example)

### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/backend .
gcloud run deploy backend --image gcr.io/PROJECT-ID/backend
```

### Kubernetes
```bash
# Create deployment
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml

# View status
kubectl get pods
kubectl get svc
```

### Local Kubernetes (Docker Desktop)
```bash
# Enable Kubernetes in Docker Desktop settings

# Deploy
kubectl apply -f kubernetes/

# View services
kubectl get svc
```

---

## Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

---

## Support

For detailed information:
- 📖 Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- 📋 Check [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md)
- 🔄 Review [BEFORE_AFTER_COMPARISON.md](BEFORE_AFTER_COMPARISON.md)
- 📦 See [REQUIRED_DEPENDENCIES.md](REQUIRED_DEPENDENCIES.md)

---

**Status**: Production Ready ✅
**Last Updated**: November 2025

