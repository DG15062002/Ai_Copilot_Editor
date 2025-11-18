# frontend/ai-copilot-editor/Dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY frontend/ai-copilot-editor/package*.json ./
RUN npm ci
COPY frontend/ai-copilot-editor/ ./
RUN npm run build

# Production stage: serve with nginx
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# Optional: custom nginx conf for SPA routing
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
