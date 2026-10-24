# ==========================================
# Stage 1: Build Frontend Production Assets
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Accept build arguments for Vite environment variables
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install exact dependencies using package-lock.json
RUN npm ci

# Copy frontend source files
COPY . .

# Build the production bundle into /app/dist
RUN npm run build

# ==========================================
# Stage 2: Serve Production Assets with Nginx
# ==========================================
FROM nginx:alpine

# Copy custom Nginx configuration supporting React Router SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled production artifacts from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose internal HTTP port
EXPOSE 80

# Run Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
