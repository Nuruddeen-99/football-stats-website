function Loader({ label = "Loading…" }) {
  return (
    <div className="global-loader-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{label}</span>
    </div>
  );
}

export default Loader;
