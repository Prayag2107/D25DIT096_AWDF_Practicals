import { lazy } from 'react';

/**
 * Reusable helper that wraps a dynamic import with an artificial minimum delay.
 * Useful in educational demonstrations (Practical 8 Step 5) to observe the Suspense
 * fallback UI on ultra-fast local connections without flickering.
 *
 * @param {Function} importFn - Function returning dynamic import promise, e.g. () => import('./pages/Projects')
 * @param {number} minDelayMs - Artificial delay in milliseconds (default: 300ms)
 * @returns {React.LazyExoticComponent} Lazy-loaded component
 */
export function lazyWithDelay(importFn, minDelayMs = 300) {
  return lazy(() =>
    Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, minDelayMs))
    ]).then(([module]) => module)
  );
}
