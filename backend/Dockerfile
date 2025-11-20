# backend/Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Build args for flexibility
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install dependencies first for better layer caching
COPY backend/package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY backend/ ./

# Create app directory with correct permissions
RUN chown -R appuser:appgroup /usr/src/app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5005/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run application with node (use npm start in production)
CMD ["node", "server.js"]
