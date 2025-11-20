# Required Dependencies

This document outlines the dependencies needed for the improved deployment setup.

## Backend Dependencies

Update your `backend/package.json` to include these production dependencies:

```json
{
  "name": "ai-copilot-backend",
  "version": "1.0.0",
  "description": "AI Copilot Editor Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "keywords": ["api", "express", "ai"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "helmet": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Package Descriptions

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18.2 | Web framework |
| `body-parser` | ^1.20.2 | Parse request bodies |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `compression` | ^1.7.4 | gzip compression middleware |
| `helmet` | ^7.0.0 | Security headers |
| `nodemon` | ^3.0.1 (dev) | Auto-restart during development |

---

## Frontend Dependencies

Your `frontend/ai-copilot-editor/package.json` should already include:

```json
{
  "name": "ai-copilot-editor",
  "version": "1.0.0",
  "description": "AI Copilot Editor Frontend",
  "dependencies": {
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

---

## Installation

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend/ai-copilot-editor
npm install
```

---

## Version Compatibility

- **Node.js**: >= 18.0.0 (LTS)
- **npm**: >= 9.0.0
- **Express**: 4.x (latest stable)
- **React**: 18.x

### Platform Support
- ✅ macOS (Intel & Apple Silicon)
- ✅ Linux (Ubuntu, Alpine, Debian)
- ✅ Windows (WSL2)
- ✅ Docker containers

---

## Migration Guide (From Old Setup)

If you're upgrading from the old setup:

1. **Update backend/package.json** with new dependencies (helmet, compression)
2. **Install new dependencies**:
   ```bash
   npm install --save helmet compression
   ```
3. **Update backend/server.js** with new code
4. **Update Dockerfiles** with improved versions
5. **Test locally** with docker-compose before deploying

---

## Production vs Development

### Development Mode
```bash
NODE_ENV=development npm start
```
- Full error messages in responses
- Verbose logging
- Hot-reloading with nodemon (if configured)

### Production Mode
```bash
NODE_ENV=production npm start
```
- Sanitized error messages
- Structured JSON logging
- Optimized performance
- Security headers enabled

---

## Testing Dependencies (Optional)

For adding tests to your project:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

---

## Security Audit

To check for vulnerabilities in dependencies:

```bash
npm audit
npm audit fix  # Auto-fix common issues
```

---

## Docker Build with Custom Dependencies

If you need additional dependencies, the Dockerfile will automatically install them during build:

```bash
docker build -f backend/Dockerfile -t backend:latest .
```

The multi-stage caching will ensure dependencies are cached properly.

---

**Last Updated**: November 2025

