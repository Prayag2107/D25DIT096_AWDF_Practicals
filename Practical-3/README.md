# Practical 3: API Integration and Data Rendering in React

## Description
This project demonstrates asynchronous API data fetching and dynamic state-driven rendering in a **React** application built with **Vite** and **React Router DOM**. It integrates with the **GitHub REST API** to fetch and display public repositories, complete with a live search filter, loading spinner, error handling with retry functionality, and star counts.

## Key Features & Architecture
- **API Integration (`fetch` + `useEffect`)**:
  - Automatically fetches repositories from `https://api.github.com/users/{username}/repos` upon mount or user search.
- **State Management (`useState`)**:
  - Tracks `repos`, `loading`, `error`, `username`, `fetchUsername`, and `searchQuery`.
- **Conditional UI Rendering**:
  - **Loading State**: Displays animated `<Spinner />` while data is being fetched.
  - **Error State**: Displays `<ErrorMessage />` with a retry button to gracefully handle network/user errors.
  - **Success State**: Renders `<RepoList />` with repository cards, external links, and star counts.
- **Supplementary Features**:
  - **Search & Filter**: Real-time client-side repository filtering by repository name.
  - **User Search**: Allows searching for any GitHub username dynamically.
  - **Star Count**: Displays star ratings (`⭐ stargazers_count`) on each repository card.
- **Client-Side Routing (`react-router-dom`)**:
  - `Home` (`/`): Landing page.
  - `Projects` (`/projects`): Dynamic GitHub API repository showcase.
  - `Contact` (`/contact`): Contact details and inquiry form.
  - `NotFound` (`*`): 404 error page.

## Tech Stack
- **Framework**: React 18
- **Bundler**: Vite
- **Routing**: `react-router-dom` v6
- **Data Source**: GitHub REST API
- **Styling**: Vanilla CSS

## Setup and Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
