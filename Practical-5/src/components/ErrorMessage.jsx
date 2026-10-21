// ErrorMessage.jsx – Displayed when an API call fails
// Accepts: message (string), onRetry (function) — supplementary: retry button
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <span className="error-icon">⚠️</span>
      <p className="error-text">
        Something went wrong: <strong>{message}</strong>
      </p>
      {/* Supplementary: Retry button re-triggers the fetch */}
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          🔄 Retry
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
