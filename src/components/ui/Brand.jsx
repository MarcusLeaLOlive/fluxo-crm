import { SITE } from "../../config/site.js";

export function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true" className="brand-mark">
      <defs>
        <linearGradient id="brand-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <rect width="28" height="28" rx="8" fill="url(#brand-g)" />
      <rect x="6.5" y="8.5" width="15" height="2.6" rx="1.3" fill="#fff" opacity=".55" />
      <rect x="8.5" y="12.8" width="11" height="2.6" rx="1.3" fill="#fff" opacity=".8" />
      <rect x="10.5" y="17.1" width="7" height="2.6" rx="1.3" fill="#fff" />
    </svg>
  );
}

export function Brand({ onClick, href = "#" }) {
  return (
    <a className="brand" href={href} onClick={onClick} aria-label={`${SITE.product}, página inicial`}>
      <BrandMark />
      <span className="brand__name">{SITE.product}</span>
    </a>
  );
}
