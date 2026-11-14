import { SEASONS } from "../data/seasons";

function SeasonSelect({
  value,
  onChange,
  seasons = SEASONS,
  label = "Season",
  id = "season-select",
}) {
  const options =
    value && !seasons.includes(String(value))
      ? [String(value), ...seasons]
      : seasons.map(String);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <label
        htmlFor={id}
        style={{
          color: "var(--text-muted)",
          fontSize: "0.78rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </label>
      <select
        id={id}
        className="select-control"
        value={value}
        onChange={onChange}
      >
        {options.map((season) => (
          <option key={season} value={season}>
            {season}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SeasonSelect;
