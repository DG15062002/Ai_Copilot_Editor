# frontend/ai-copilot-editor/Dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Build args for flexibility
ARG REACT_APP_API_URL=http://localhost:5005
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Install dependencies
COPY frontend/ai-copilot-editor/package*.json ./
RUN npm ci && npm cache clean --force

# Copy source and build
COPY frontend/ai-copilot-editor/ ./
RUN npm run build

# Production stage: serve with nginx
FROM nginx:stable-alpine

# Set environment variables for nginx
ENV NGINX_PORT=3000

# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration for SPA routing and security headers
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx cache and log directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# Create non-root user context (nginx already runs as nginx user)
USER nginx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
