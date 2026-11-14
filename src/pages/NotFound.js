import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="empty-state" style={{ padding: "5rem 1rem" }}>
      <p
        style={{
          fontSize: "3rem",
          fontWeight: 700,
          color: "var(--accent-green)",
          lineHeight: 1,
        }}
      >
        404
      </p>
      <h1 style={{ fontSize: "1.15rem", margin: "0.75rem 0 0.35rem" }}>
        Page not found
      </h1>
      <p style={{ marginBottom: "1.5rem" }}>
        The page you are looking for does not exist or has moved.
      </p>
      <Link to="/" className="btn-primary">
        <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        Back to news
      </Link>
    </div>
  );
}

export default NotFound;
