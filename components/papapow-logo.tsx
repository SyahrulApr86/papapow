export function PapapowLogo({ compact = false }: { compact?: boolean }) {
  const uid = compact ? "c" : "h";
  return (
    <span className={compact ? "papapow-logo compact" : "papapow-logo"}>
      <svg aria-hidden="true" viewBox="0 0 300 96" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`chrome-${uid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e8e8e8" />
            <stop offset="18%" stopColor="#ffffff" />
            <stop offset="38%" stopColor="#9a9a9a" />
            <stop offset="52%" stopColor="#ffffff" />
            <stop offset="72%" stopColor="#c0c0c0" />
            <stop offset="100%" stopColor="#4a4a4a" />
          </linearGradient>
          <linearGradient id={`orbit-${uid}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#555" />
            <stop offset="30%" stopColor="#d4d4d4" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#d4d4d4" />
            <stop offset="100%" stopColor="#555" />
          </linearGradient>
          <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* orbit ellipse */}
        <ellipse
          className="logo-orbit"
          cx="150" cy="48" rx="132" ry="32"
          stroke={`url(#orbit-${uid})`}
        />
        {/* upper swoosh arc */}
        <path
          className="logo-slash"
          d="M67 22 C122 2 184 1 235 22"
          stroke={`url(#orbit-${uid})`}
        />

        {/* large star — left */}
        <path
          className="logo-star"
          d="M34 21 L38 35 L52 39 L38 43 L34 57 L30 43 L16 39 L30 35 Z"
          filter={`url(#glow-${uid})`}
        />
        {/* medium star — right */}
        <path
          className="logo-star small"
          d="M258 15 L262 25 L272 29 L262 33 L258 43 L254 33 L244 29 L254 25 Z"
          filter={`url(#glow-${uid})`}
        />
        {/* mini star */}
        <path
          className="logo-star mini"
          d="M221 60 L224 68 L232 71 L224 74 L221 82 L218 74 L210 71 L218 68 Z"
          filter={`url(#glow-${uid})`}
        />
        {/* tiny dot accent */}
        <circle cx="46" cy="64" r="3" className="logo-dot" />

        <text x="150" y="61" textAnchor="middle" fill={`url(#chrome-${uid})`}>
          PAPAPOW
        </text>
      </svg>
    </span>
  );
}
