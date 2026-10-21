import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Meaningful Suspense fallback component for lazy-loaded routes and components.
 * Matches TaskMaster dark theme with accessible ARIA live attributes.
 */
function PageLoader({ message = 'Loading page resources...' }) {
  return (
    <div
      className="page-loader-wrapper"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="page-loader-card">
        <div className="page-loader-spinner-container">
          <Loader2 className="page-loader-spinner-icon" size={36} />
          <div className="page-loader-pulse-ring" aria-hidden="true" />
        </div>
        <div className="page-loader-content">
          <h3 className="page-loader-title">Loading Page</h3>
          <p className="page-loader-message">{message}</p>
          <div className="page-loader-bar-bg" aria-hidden="true">
            <div className="page-loader-bar-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
