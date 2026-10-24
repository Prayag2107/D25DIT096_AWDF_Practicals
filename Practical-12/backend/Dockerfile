# Practical 11 - Backend Dockerfile
# Base image: Official lightweight Node.js LTS Alpine image
FROM node:20-alpine

# Set container working directory
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install exact dependencies defined in package-lock.json
RUN npm ci

# Copy backend application source code
COPY . .

# Set ownership of the application directory to the non-root 'node' user
RUN chown -R node:node /app

# Switch to the non-root user for security best practices
USER node

# Expose backend service port
EXPOSE 5000

# Start Express server via npm start script
CMD ["npm", "start"]
