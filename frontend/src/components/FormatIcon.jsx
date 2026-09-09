import { C } from "../constants";

export default function FormatIcon({ format, size = 16, color }) {
  const col = color || C.ink;

  if (format === "Vinyl") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={col} strokeWidth="1.4" />
        <circle cx="12" cy="12" r="6.2" stroke={col} strokeWidth="0.9" opacity="0.55" />
        <circle cx="12" cy="12" r="2.1" fill={col} />
      </svg>
    );
  }
  if (format === "Cassette") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2.5" y="5" width="19" height="14" rx="1.4" stroke={col} strokeWidth="1.4" />
        <circle cx="8.3" cy="12" r="2.1" stroke={col} strokeWidth="1.2" />
        <circle cx="15.7" cy="12" r="2.1" stroke={col} strokeWidth="1.2" />
        <path d="M9.8 16.2h4.4" stroke={col} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (format === "CD") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={col} strokeWidth="1.4" />
        <circle cx="12" cy="12" r="2" fill={col} />
        <path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke={col} strokeWidth="0.8" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke={col} strokeWidth="1.4" />
    </svg>
  );
}
