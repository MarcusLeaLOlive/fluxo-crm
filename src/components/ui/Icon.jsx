/* Ícones em SVG inline: leves, herdam a cor do texto e não dependem de biblioteca. */
const PATHS = {
  plus: <path d="M8 3v10M3 8h10" />,
  download: <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />,
  close: <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />,
  search: (
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 14 14" />
    </>
  ),
  arrowRight: <path d="M3 8h10M9 4l4 4-4 4" />,
  arrowLeft: <path d="M13 8H3M7 4 3 8l4 4" />,
  check: <path d="M3 8.5 6.5 12 13 4.5" />,
  external: <path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7.5 8.5" />,
  sort: <path d="M5.5 6 8 3.5 10.5 6M5.5 10 8 12.5 10.5 10" />,
  keyboard: (
    <>
      <rect x="1.5" y="4" width="13" height="8" rx="1.5" />
      <path d="M4 7h1M7 7h1M10 7h2M4.5 9.5h7" />
    </>
  ),
  board: (
    <>
      <rect x="2" y="2.5" width="3.2" height="11" rx="1" />
      <rect x="6.4" y="2.5" width="3.2" height="7" rx="1" />
      <rect x="10.8" y="2.5" width="3.2" height="9" rx="1" />
    </>
  ),
  chart: <path d="M2.5 13.5h11M4.5 11V8M8 11V4.5M11.5 11V6.5" />,
  bell: <path d="M4 11V7a4 4 0 0 1 8 0v4l1 1.5H3L4 11ZM6.5 14h3" />,
  form: (
    <>
      <rect x="2.5" y="2" width="11" height="12" rx="1.5" />
      <path d="M5 5.5h6M5 8h6M5 10.5h3.5" />
    </>
  ),
  shield: <path d="M8 1.8 13 4v4c0 3-2.2 5.2-5 6.2C5.2 13.2 3 11 3 8V4l5-2.2ZM5.8 8l1.6 1.6L10.4 6.5" />,
  code: <path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5M9 3 7 13" />,
  sun: (
    <>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
    </>
  ),
  moon: <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" />,
  user: (
    <>
      <circle cx="8" cy="5.5" r="2.8" />
      <path d="M2.8 14a5.2 5.2 0 0 1 10.4 0" />
    </>
  ),
  eye: (
    <>
      <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" />
      <circle cx="8" cy="8" r="2" />
    </>
  ),
  eyeOff: <path d="M2 2l12 12M6.6 6.7A2 2 0 0 0 9.3 9.4M4.2 4.4C2.6 5.6 1.5 8 1.5 8S4 12.5 8 12.5c1.3 0 2.5-.4 3.5-1M7 3.6c.3 0 .7-.1 1-.1 4 0 6.5 4.5 6.5 4.5s-.6 1.1-1.7 2.3" />,
  logout: <path d="M6 2.5H3.5v11H6M10 5l3 3-3 3M13 8H6" />,
  pie: <path d="M8 2a6 6 0 1 0 6 6H8V2ZM10 1.5V6h4.5A4.5 4.5 0 0 0 10 1.5Z" />,
  filter: <path d="M2 3h12l-4.5 5.5V13l-3-1.5V8.5L2 3Z" />,
  alert: <path d="M8 2 1.5 13.5h13L8 2ZM8 6.5v3M8 11.5v.2" />,
};

export function Icon({ name, size = 16, strokeWidth = 1.6, className = "" }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
