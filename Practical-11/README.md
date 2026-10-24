# Practical 11: Containerization with Docker and Docker Compose

**Course:** Advanced Web Development Frameworks (AWDF)  
**Student ID:** D25DIT096  
**Application:** Full-Stack Task Management System (React + Vite + Express.js + MongoDB)  

---

## 1. Objective

The objective of Practical 11 is to containerize the existing full-stack Task Management application developed across Practicals 1–10 using Docker and Docker Compose. 

The application architecture includes three containerized microservices:
1. **Frontend:** React SPA built using Vite and served through high-performance Nginx web server with client-side routing fallback.
2. **Backend:** Node.js Express API server implementing JWT authentication, input validation, in-memory caching (`node-cache`), and event-driven notifications (`EventEmitter`).
3. **Database:** Official MongoDB container (`mongo:7`) with automated health checks and persistent volume storage.

All three services are orchestrated using a single Docker Compose specification (`docker-compose.yml`) connected via an internal Docker bridge network (`app-network`), enabling the entire application to start with a single command.

---

## 2. Theoretical Background

### What is Containerization?
Containerization is an operating-system-level virtualization technique that packages an application together with all its dependencies, runtime environments, system libraries, configuration files, and binaries into a lightweight, isolated, and portable executable unit known as a **Container**.

### Containers vs. Virtual Machines (VMs)
- **Virtual Machines:** Hypervisor-based virtualization where each VM runs a full guest operating system on virtualized hardware. This results in heavy resource consumption, gigabytes of disk footprint, and slow multi-minute boot times.
- **Containers:** Share the host operating system's kernel while isolating processes in user space using Linux kernel primitives (**cgroups** for resource limits and **namespaces** for process, network, and mount isolation). Containers boot in milliseconds, have near-native bare-metal execution performance, and require significantly lower memory.

### Role of Docker & Docker Compose
- **Docker Engine:** The client-server runtime engine responsible for creating, running, shipping, and managing container images and running containers.
- **Docker Compose:** A multi-container orchestration tool defined through declarative YAML files (`docker-compose.yml`). Compose coordinates service definitions, dependency graphs (`depends_on`), build contexts, port mappings, volumes, health checks, and user-defined bridge networks.

---

## 3. System Architecture

```text
                                 User Web Browser
                                        |
               +------------------------+------------------------+
               | (Port 5173 - Host)                              | (Port 5000 - Host)
               v                                                 v
    +-----------------------+                         +----------------------+
    |    task-frontend      |                         |     task-backend     |
    |      (Container)      |                         |      (Container)     |
    |   Nginx Web Server    |                         |  Express Node.js API |
    |   Port 80 (Internal)  |                         | Port 5000 (Internal) |
    |   Serves React Build  |                         | Non-Root 'node' user |
    +-----------------------+                         +----------------------+
               |                                                 |
               |                                                 | Host: "mongodb"
               |                                                 | Port: 27017
               |            Docker Bridge Network                |
               |               ("app-network")                   |
               +-------------------------------------------------+
                                        |
                                        v
                             +----------------------+
                             |     task-mongodb     |
                             |      (Container)     |
                             |  Official mongo:7    |
                             | Port 27017 (Internal)|
                             +----------------------+
                                        |
                                        v
                            Docker Named Volume:
                              "mongodb_data"
                           (/data/db on container)
```

### Networking Logic:
1. **Browser-to-Backend:** The host web browser runs outside Docker. It communicates with the backend via mapped host port `http://localhost:5000/api`. The internal Docker hostname `backend` is NOT resolvable by the host browser's DNS.
2. **Backend-to-Database:** The backend container communicates directly with MongoDB over the internal Docker network `app-network` using the Compose service name as DNS hostname: `mongodb://mongodb:27017/task_management`.

---

## 4. Directory Structure

```text
Practical-11/
├── .env                          # Root Compose environment variables
├── .env.example                  # Environment template for reproducibility
├── docker-compose.yml            # Multi-service Compose orchestrator
├── postman_collection.json       # Postman API test suite (Port 5000)
├── README.md                     # Comprehensive documentation & practical report
├── backend/
│   ├── .dockerignore             # Excludes node_modules, local secrets, tests
│   ├── .env                      # Local development environment file
│   ├── .env.example              # Template for backend environment
│   ├── .gitignore
│   ├── Dockerfile                # Production Node.js 20 Alpine image
│   ├── package.json              # Express, Mongoose, JWT, Node-Cache dependencies
│   ├── package-lock.json
│   ├── server.js                 # Entry point with 0.0.0.0 host binding & health check
│   ├── config/
│   │   └── db.js                 # Environment-aware MongoDB connection with masking
│   ├── controllers/
│   │   ├── authController.js     # JWT register, login, me
│   │   └── taskController.js     # Task CRUD with in-memory caching & event emission
│   ├── events/
│   │   ├── taskEventEmitter.js   # Node.js EventEmitter instance
│   │   └── taskListeners.js      # Asynchronous notification listeners
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   ├── errorMiddleware.js    # 404 & Centralized error handler
│   │   └── validationMiddleware.js # Express-validator rules
│   ├── models/
│   │   ├── Task.js               # Mongoose Task schema
│   │   └── User.js               # Mongoose User schema with bcrypt password hashing
│   └── utils/
│       └── cacheService.js       # In-memory node-cache service
└── frontend/
    ├── .dockerignore             # Excludes node_modules, dist, local secrets
    ├── .env                      # Local development Vite config
    ├── .env.example              # Frontend environment template
    ├── .gitignore
    ├── Dockerfile                # Multi-stage build (Node 20 Alpine -> Nginx Alpine)
    ├── nginx.conf                # Nginx SPA fallback configuration (try_files)
    ├── index.html                # Single Page Application HTML root
    ├── package.json              # React 19, React Router v7, Lucide React
    ├── package-lock.json
    ├── vite.config.js            # Vite build configuration
    ├── public/
    └── src/
        ├── App.jsx               # React Router layout and protected routes
        ├── index.css             # Design tokens and responsive styles
        ├── main.jsx              # React root mount
        ├── api/
        │   └── api.js            # Centralized API service (configurable VITE_API_URL)
        ├── components/
        │   ├── ConfirmDialog.jsx
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── TaskForm.jsx
        │   ├── TaskItem.jsx
        │   ├── TaskList.jsx
        │   └── Toast.jsx
        ├── context/
        │   └── AuthContext.jsx   # Authentication React Context
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            └── TaskDashboard.jsx
```

---

## 5. Docker Configuration Files

### 5.1 Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
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
```

### 5.2 Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
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
```

### 5.3 Nginx Configuration (`frontend/nginx.conf`)
```nginx
server {
    listen 80;
    server_name localhost;

    # Root directory for static production files
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Gzip compression for optimal delivery
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # Client-side routing fallback for React Router SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets (CSS, JS, images, fonts)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 5.4 Docker Compose (`docker-compose.yml`)
```yaml
services:
  # ==============================================================
  # Service 1: MongoDB Database Service
  # ==============================================================
  mongodb:
    image: mongo:7
    container_name: task-mongodb
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    ports:
      - "27017:27017"
    healthcheck:
      test:
        [
          "CMD",
          "mongosh",
          "--quiet",
          "--eval",
          "db.adminCommand('ping').ok"
        ]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # ==============================================================
  # Service 2: Express.js Backend API Service
  # ==============================================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: task-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      PORT: 5000
      MONGO_URI: mongodb://mongodb:27017/task_management
      JWT_SECRET: ${JWT_SECRET:-pr11_super_secret_jwt_key_98234729384729384_container_2026}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-1h}
      CLIENT_URL: ${CLIENT_URL:-http://localhost:5173}
      CACHE_TTL: ${CACHE_TTL:-60}
      ENABLE_CACHE: ${ENABLE_CACHE:-true}
      NOTIFICATION_DELAY_MS: ${NOTIFICATION_DELAY_MS:-2000}
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - app-network

  # ==============================================================
  # Service 3: React + Vite Frontend (Served via Nginx)
  # ==============================================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL:-http://localhost:5000/api}
    container_name: task-frontend
    restart: unless-stopped
    ports:
      - "5173:80"
    depends_on:
      - backend
    networks:
      - app-network

# ==============================================================
# Isolated Bridge Network for Container-to-Container Interconnect
# ==============================================================
networks:
  app-network:
    driver: bridge

# ==============================================================
# Persistent Named Volume for MongoDB Data Storage
# ==============================================================
volumes:
  mongodb_data:
    driver: local
```

---

## 6. Key Configuration Adaptations

### 6.1 Database Connection (`backend/config/db.js`)
The connection configuration dynamically reads `process.env.MONGO_URI` (which resolves to `mongodb://mongodb:27017/task_management` in Compose) and falls back safely to `127.0.0.1:27017` for host development:
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_management';
    const sanitizedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

    try {
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`[Database Error] Failed to connect to MongoDB at: ${sanitizedURI}`);
        console.error(`[Database Error] Details: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
```

### 6.2 Host Binding & Health Endpoint (`backend/server.js`)
Node.js Express must bind to `0.0.0.0` rather than `localhost` inside a container. If Express binds to `127.0.0.1`, it only accepts requests originated inside its own container loopback interface, causing Docker port forwarding from host to fail with connection refused.
```javascript
server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
```

### 6.3 Frontend Centralized API URL (`frontend/src/api/api.js`)
Configured to use build-time `import.meta.env.VITE_API_URL` defaulting to `http://localhost:5000/api`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_BASE_URL = API_URL;
```

---

## 7. Step-by-Step Execution Guide (Windows PowerShell)

### Step 1: Verify Prerequisites
Ensure Docker Desktop is running and verify the CLI:
```powershell
docker --version
docker compose version
docker info
```

### Step 2: Build and Start All Services
Build images and start all three containers in detached mode:
```powershell
docker compose up --build -d
```
*Note: To run in the foreground with live merged logs, omit `-d`:*
```powershell
docker compose up --build
```

### Step 3: Check Container Status
Verify that all containers are healthy and running:
```powershell
docker compose ps
```
Expected output:
```text
NAME            IMAGE                   COMMAND                  SERVICE    STATUS                    PORTS
task-backend    practical-11-backend    "docker-entrypoint.s…"   backend    Up 15 seconds             0.0.0.0:5000->5000/tcp
task-frontend   practical-11-frontend   "/docker-entrypoint.…"   frontend   Up 14 seconds             0.0.0.0:5173->80/tcp
task-mongodb    mongo:7                 "docker-entrypoint.s…"   mongodb    Up 20 seconds (healthy)   0.0.0.0:27017->27017/tcp
```

### Step 4: Inspect Service Logs
```powershell
# View logs of specific services
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb

# Stream all logs continuously
docker compose logs -f
```

### Step 5: Test Data Persistence Across Container Restarts
```powershell
# 1. Stop and remove containers and network (named volume is preserved!)
docker compose down

# 2. Re-launch containers
docker compose up -d --build

# 3. Verify previous tasks are still intact in MongoDB!
```

### Step 6: Teardown
```powershell
# Stop services and remove containers/networks:
docker compose down

# (OPTIONAL) To completely wipe database volume and reset:
docker compose down -v
```

---

## 8. Verification and End-to-End Testing Results

| Test Item | Endpoint / Target | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **Frontend Root** | `http://localhost:5173/` | HTTP 200, Nginx serves React SPA | HTTP 200 OK | **PASSED** |
| **Frontend Route Fallback** | `http://localhost:5173/login` | HTTP 200, SPA fallback via `try_files` | HTTP 200 OK | **PASSED** |
| **Backend Health** | `http://localhost:5000/api/health` | HTTP 200 with cache and event metadata | HTTP 200 OK | **PASSED** |
| **Backend Root** | `http://localhost:5000/` | HTTP 200 API descriptor | HTTP 200 OK | **PASSED** |
| **User Registration** | `POST /api/auth/register` | HTTP 201 User created, password hashed | HTTP 201 Created | **PASSED** |
| **User Login** | `POST /api/auth/login` | HTTP 200 Returns signed JWT token | HTTP 200 Token issued | **PASSED** |
| **Protected Profile** | `GET /api/auth/me` | HTTP 200 Returns authenticated user payload | HTTP 200 User verified | **PASSED** |
| **Task Creation** | `POST /api/tasks` | HTTP 201 Saved in MongoDB, event emitted | HTTP 201 Created | **PASSED** |
| **Task Cache MISS** | `GET /api/tasks` (1st req) | HTTP 200 Header `X-Cache: MISS` | HTTP 200 `X-Cache: MISS` | **PASSED** |
| **Task Cache HIT** | `GET /api/tasks` (2nd req) | HTTP 200 Header `X-Cache: HIT` | HTTP 200 `X-Cache: HIT` | **PASSED** |
| **Task Update** | `PUT /api/tasks/:id` | HTTP 200 Status updated to Completed | HTTP 200 Updated | **PASSED** |
| **MongoDB Persistence** | Restart containers | Canary task restored from `mongodb_data` | Task ID 6adcb30b restored | **PASSED** |

---

## 9. Troubleshooting Guide

1. **Docker Daemon Not Running:**
   - *Error:* `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`
   - *Fix:* Ensure Docker Desktop is started from Windows Start Menu or run `Start-Process "C:\Users\<user>\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"`.
2. **Port Conflicts (`0.0.0.0:5000` or `0.0.0.0:27017` already allocated):**
   - *Error:* `bind: address already in use`
   - *Fix:* Check running processes using `netstat -ano | findstr ":5000"` and kill the occupying process using `Stop-Process -Id <PID> -Force`. For MongoDB, stop the local Windows MongoDB service via Services management or configure custom host port in `.env`.
3. **Backend Cannot Connect to MongoDB:**
   - *Error:* `MongooseServerSelectionError: connect ECONNREFUSED`
   - *Fix:* Verify that `MONGO_URI` is set to `mongodb://mongodb:27017/task_management` in `docker-compose.yml`, not `localhost`. Verify both containers share `app-network`.
4. **React Router Refresh Returns 404:**
   - *Error:* Nginx returns `404 Not Found` when refreshing `/login` or `/tasks`.
   - *Fix:* Ensure `frontend/nginx.conf` has `try_files $uri $uri/ /index.html;` inside `location /`.
5. **CORS Errors in Browser Console:**
   - *Error:* `Access-Control-Allow-Origin header is missing`
   - *Fix:* Ensure backend `server.js` includes `CLIENT_URL` (e.g. `http://localhost:5173`) in `allowedOrigins`.

---

## 10. Answers to Viva Questions

### 1. What is Docker?
Docker is an open-source platform that enables developers to build, package, ship, and run applications inside lightweight, isolated units called containers using OS-level virtualization.

### 2. What is a Docker image?
A Docker image is a read-only, immutable template consisting of stacked filesystem layers. It contains the application code, runtime libraries, environment configurations, and system binaries needed to run an application. Images are instantiated into running containers.

### 3. What is a Docker container?
A Docker container is a runnable, isolated instance of a Docker image. It adds a thin, writable container layer on top of the immutable image layers and runs as an isolated process on the host operating system kernel.

### 4. What is Docker Compose?
Docker Compose is a tool for defining and orchestrating multi-container Docker applications. It uses a YAML configuration file (`docker-compose.yml`) to configure application services, networks, volumes, environment variables, dependencies, and health checks with single-command startup.

### 5. Why does the backend use the hostname `mongodb` instead of `localhost`?
Inside Docker, each container operates in its own isolated network namespace with its own `localhost` (127.0.0.1) pointing only to itself. Docker provides an embedded DNS server on user-defined bridge networks that automatically resolves Compose service names (such as `mongodb`) to the corresponding container's internal IP address.

### 6. What is the difference between `EXPOSE` and the `ports` mapping in Docker Compose?
- `EXPOSE` in a Dockerfile is purely documentation and metadata declaring which port the container listens on internally. It does NOT publish or forward the port to the host machine.
- `ports` in `docker-compose.yml` (`HOST:CONTAINER`, e.g., `"5000:5000"`) actively configures Docker's network proxy and iptables/host firewall to bind a host port and forward incoming traffic to the container port.

### 7. Why should `node_modules` not be copied into the image?
1. The local `node_modules` directory may contain binary addons compiled for the host OS (e.g., Windows x64) that will crash inside the Linux container (Alpine Linux musl).
2. Local `node_modules` inflate the build context size to hundreds of megabytes, drastically slowing down builds.
3. Dependencies should be installed cleanly inside the container using `npm ci` to guarantee consistency across platforms.

### 8. What is a `.dockerignore` file?
A `.dockerignore` file specifies patterns of files and directories that the Docker CLI should exclude when sending the build context to the Docker daemon. This prevents bloating images, speeds up build performance, and prevents accidental leaks of sensitive files like `.env`, `.git`, or temporary logs.

### 9. What is a multi-stage Docker build?
A multi-stage build uses multiple `FROM` instructions in a single Dockerfile. Intermediate stages perform heavy tasks like dependency installation and compilation (e.g., Node.js and Vite building the React app), while the final stage copies only the compiled production artifacts (e.g., `/app/dist`) into a minimal runtime image (e.g., Nginx Alpine). This reduces the final image size from 500MB+ down to ~25MB.

### 10. Why is a named volume required for MongoDB?
Containers are ephemeral by default; any data written to a container's writable layer is permanently lost when the container is removed or recreated. A Docker named volume (`mongodb_data`) stores MongoDB data files on the host storage outside the container filesystem lifecycle, ensuring complete data persistence across container restarts and redeployments.

### 11. What is the purpose of a Docker bridge network?
A user-defined Docker bridge network (`app-network`) isolates container-to-container communication from other external processes on the host. It provides automatic service discovery via container names, port isolation (containers can talk to each other without exposing ports to the host), and controlled network routing.

### 12. What does `depends_on` do, and how is a health check different?
- Basic `depends_on: [mongodb]` only controls container startup order (it starts the backend container as soon as the MongoDB container process starts, which is typically before the MongoDB engine has finished initializing and listening for socket connections).
- A **health check** with `condition: service_healthy` actively executes a probe command (such as `mongosh --eval "db.adminCommand('ping').ok"`). The backend container is held in a waiting state until MongoDB passes the health probe, preventing connection failure crashes at startup.

### 13. Why should secrets not be included in Docker images?
Docker images are built from immutable layers. Any secret (such as database passwords or JWT secret keys) copied or baked into an image layer remains retrievable using `docker history` or inspection tools, even if deleted in a later layer. Shipping images with hardcoded secrets poses severe security risks. Secrets must always be injected at runtime via environment variables or secret management systems.

### 14. What is the difference between `docker compose up` and `docker compose down`?
- `docker compose up`: Builds, creates, and starts all containers, networks, and volumes declared in the configuration.
- `docker compose down`: Gracefully stops and removes all containers and networks created by `up`. By default, it preserves named volumes so database data remains intact. Passing `-v` (`docker compose down -v`) removes the volumes as well.

### 15. How does Docker make a full-stack application easier to run on another machine?
Docker eliminates the "it works on my machine" problem by encapsulating the entire full-stack runtime environment—operating system distribution, exact Node.js and MongoDB versions, dependencies, environment configurations, and network topology—into standard container images. Any developer or server with Docker installed can run the entire application using `docker compose up` without manually installing Node.js, npm packages, or MongoDB on the host machine.

---

## 11. Conclusion

In Practical 11, the full-stack Task Management application was containerized using Docker and Docker Compose. Multi-stage Docker builds were used for the React frontend to achieve a lean production Nginx image with client-side routing fallback. The Express.js backend was packaged into a non-root Node.js Alpine container with explicit host bindings, centralized health routes, and dynamic environment resolution. MongoDB was integrated with health check probes and a persistent named volume to ensure reliable data persistence. All services were unified on an internal Docker bridge network (`app-network`), fulfilling the single-command startup requirement (`docker compose up --build`) while maintaining JWT authentication, input validation, in-memory caching, and event-driven notifications.
