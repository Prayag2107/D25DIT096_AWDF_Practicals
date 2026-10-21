// Spinner.jsx – Loading indicator shown while an API request is in progress
function Spinner() {
  return (
    <div className="spinner-wrapper" role="status" aria-label="Loading…">
      <div className="spinner" />
      <p className="spinner-text">Loading…</p>
    </div>
  );
}

export default Spinner;
