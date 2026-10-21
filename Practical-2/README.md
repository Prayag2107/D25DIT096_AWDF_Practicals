# Practical 2: Multi-Page React Portfolio with Routing & Theme Switcher

## Description
This project is an interactive multi-page React application built using **Vite** and **React Router DOM**. It demonstrates client-side routing, navigation components, dynamic layout rendering, and dark/light theme switching with CSS class toggling.

## Key Features
- **Client-Side Routing (`react-router-dom`)**:
  - `Home` (`/`): Landing introduction
  - `Projects` (`/projects`): Portfolio showcase
  - `Contact` (`/contact`): Contact details and inquiry form
  - `NotFound` (`*`): Custom 404 page for unmatched routes
- **Theme Switcher**: Dark and light mode toggle managed via state and applied to the root document element.
- **Reusable UI Components**: Modular Navigation Bar (`NavBar`) and `Footer`.

## Tech Stack
- **Framework**: React 18
- **Bundler**: Vite
- **Routing**: `react-router-dom` v6
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
