# backend/Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies first (cache)
#COPY backend/package*.json ./
#RUN npm ci --only=production

# Copy rest of backend
COPY . ./

# Expose port
EXPOSE 5005

# Use a non-root user (optional)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "server.js"]
