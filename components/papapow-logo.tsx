export function PapapowLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "papapow-logo compact" : "papapow-logo"}>
      <svg aria-hidden="true" viewBox="0 0 300 96">
        <defs>
          <linearGradient id="chrome" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.34" stopColor="#a7a7a7" />
            <stop offset="0.55" stopColor="#ffffff" />
            <stop offset="1" stopColor="#585858" />
          </linearGradient>
        </defs>
        <ellipse className="logo-orbit" cx="150" cy="48" rx="132" ry="32" />
        <path className="logo-slash" d="M67 22 C122 2 184 1 235 22" />
        <path className="logo-star" d="M34 21 L41 39 L59 46 L41 53 L34 72 L27 53 L9 46 L27 39 Z" />
        <path className="logo-star small" d="M252 18 L257 30 L269 35 L257 40 L252 52 L247 40 L235 35 L247 30 Z" />
        <path className="logo-star mini" d="M219 59 L222 67 L230 70 L222 73 L219 81 L216 73 L208 70 L216 67 Z" />
        <text x="150" y="61" textAnchor="middle">
          PAPAPOW
        </text>
      </svg>
    </span>
  );
}
