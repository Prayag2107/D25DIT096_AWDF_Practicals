# Advanced Web Development Frameworks (AWDF) - Practicals

[![CI Pipeline](https://github.com/Prayag2107/D25DIT096_AWDF_Practicals/actions/workflows/ci.yml/badge.svg)](https://github.com/Prayag2107/D25DIT096_AWDF_Practicals/actions/workflows/ci.yml)

**Student Name:** Prayag Chauhan  
**Student ID:** D25DIT096  
**Course:** Advanced Web Development Frameworks (AWDF)  
**Repository:** [Prayag2107/D25DIT096_AWDF_Practicals](https://github.com/Prayag2107/D25DIT096_AWDF_Practicals)

---

## Practicals Index

| Practical | Title | Technology Stack | Status |
|---|---|---|---|
| **Practical 1** | Portfolio Web Application | React, Vite | Completed |
| **Practical 2** | Multi-Page Portfolio with React Router and Theme Switcher | React, React Router, CSS Variables | Completed |
| **Practical 3** | API Integration and Data Rendering in React | React, Fetch API, Tailwind/CSS | Completed |
| **Practical 4** | RESTful Task Management API with Express | Express.js, Node.js | Completed |
| **Practical 5** | Express Middleware Implementation and RESTful Integration | Express.js, Custom Middleware | Completed |
| **Practical 6** | Full Stack Integration React + Node + MongoDB | React, Vite, Express, MongoDB, Mongoose | Completed |
| **Practical 7** | Authentication and Middleware Pipeline | Express.js, JWT, bcryptjs, Auth Middleware | Completed |
| **Practical 8** | Performance Optimization and Lazy Loading in React | React.lazy, Suspense, Code Splitting | Completed |
| **Practical 9** | In-Memory Caching and Query Optimization | Express.js, node-cache, MongoDB indexing | Completed |
| **Practical 10** | Event-Driven Architecture with EventEmitter | Node.js EventEmitter, Async Notifications | Completed |
| **Practical 11** | Full-Stack Containerization with Docker & Docker Compose | Docker, Docker Compose, Multi-stage builds, Nginx | Completed |
| **Practical 12** | **CI/CD Pipeline with GitHub Actions** | **GitHub Actions, Jest, Supertest, Vite, CI/CD** | **Active & Passing** |

---

## Practical 12: CI/CD Pipeline Summary

- **Workflow File:** .github/workflows/ci.yml
- **Triggers:** Automated run on push and pull_request to main
- **Runner:** ubuntu-latest with Node.js 20 LTS
- **Automated Stages:**
  1. Frontend static code analysis and linting (oxlint)
  2. Backend clean dependency installation (
pm ci)
  3. Backend automated testing with Jest and Supertest (
pm test -- --runInBand)
  4. Frontend clean dependency installation (
pm ci)
  5. Frontend production bundle compilation (ite build)
- **Status:** Integrated, verified locally and in GitHub Actions CI.
