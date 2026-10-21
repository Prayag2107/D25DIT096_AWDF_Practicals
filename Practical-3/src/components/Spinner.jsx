// Spinner.jsx – Loading indicator shown while the API request is in progress
function Spinner() {
  return (
    <div className="spinner-wrapper" role="status" aria-label="Loading repositories…">
      <div className="spinner" />
      <p className="spinner-text">Fetching repositories…</p>
    </div>
  );
}

export default Spinner;
