type BadgeIconProps = {
  slug: string;
  color: string;
  className?: string;
};

/** Simple original SVG icons — not official Girl Scout artwork. */
export function BadgeIcon({ slug, color, className }: BadgeIconProps) {
  const common = {
    viewBox: "0 0 64 64",
    className,
    "aria-hidden": true as const,
  };

  switch (slug) {
    case "waterfall":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M18 16c6 2 10 8 14 8s8-6 14-8" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <path d="M24 24v22M32 26v20M40 24v22" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M32 48c12-6 18-16 16-28-12 2-22 10-28 22 6 4 12 6 12 6z" fill={color} />
          <path d="M32 48C26 36 24 26 20 20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M22 38h22a8 8 0 0 0 1-16 10 10 0 0 0-19-3 7 7 0 0 0-4 19z" fill={color} />
        </svg>
      );
    case "sunprint":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <circle cx="32" cy="32" r="10" fill={color} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="32"
              y1="14"
              x2="32"
              y2="8"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${deg} 32 32)`}
            />
          ))}
        </svg>
      );
    case "palette":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M32 12a20 20 0 1 0 14 35c-4-1-6-4-5-8a6 6 0 0 1 6-5h1A20 20 0 0 0 32 12z" fill={color} />
          <circle cx="24" cy="26" r="3" fill="#fff" />
          <circle cx="34" cy="22" r="3" fill="#fff" opacity="0.85" />
          <circle cx="28" cy="36" r="3" fill="#fff" opacity="0.7" />
        </svg>
      );
    case "animals":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <circle cx="24" cy="24" r="6" fill={color} />
          <circle cx="40" cy="24" r="6" fill={color} />
          <circle cx="32" cy="36" r="12" fill={color} />
          <circle cx="27" cy="34" r="2" fill="#fff" />
          <circle cx="37" cy="34" r="2" fill="#fff" />
        </svg>
      );
    case "bug":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <ellipse cx="32" cy="34" rx="10" ry="14" fill={color} />
          <circle cx="32" cy="20" r="6" fill={color} />
          <path d="M26 16l-6-6M38 16l6-6M22 34h-8M42 34h8M24 44l-6 6M40 44l6 6" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "kitchen":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <rect x="18" y="26" width="28" height="20" rx="4" fill={color} />
          <path d="M24 26v-6a8 8 0 0 1 16 0v6" fill="none" stroke={color} strokeWidth="3" />
        </svg>
      );
    case "snack":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M16 40c4-14 12-20 16-20s12 6 16 20H16z" fill={color} />
          <circle cx="26" cy="34" r="2" fill="#fff" />
          <circle cx="34" cy="30" r="2" fill="#fff" />
        </svg>
      );
    case "robot":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <rect x="18" y="22" width="28" height="24" rx="6" fill={color} />
          <rect x="24" y="28" width="6" height="6" rx="1" fill="#fff" />
          <rect x="34" y="28" width="6" height="6" rx="1" fill="#fff" />
          <path d="M32 16v6M22 48v4M42 48v4" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M24 22l-10 10 10 10M40 22l10 10-10 10M36 20l-8 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "trail":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M18 44c6-4 8-10 8-14s-4-8 0-12 8 0 12 4 4 10 8 14 8 8 10 8" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx="44" cy="20" r="4" fill={color} />
        </svg>
      );
    case "camp":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M32 14L14 48h36L32 14z" fill={color} />
          <path d="M32 28v20" stroke="#fff" strokeWidth="3" />
        </svg>
      );
    case "elfhouse":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M32 14l18 16H14L32 14z" fill={color} />
          <rect x="22" y="30" width="20" height="18" fill={color} opacity="0.85" />
          <rect x="29" y="36" width="6" height="12" fill="#fff" />
        </svg>
      );
    case "shelter":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M10 40L32 18l22 22" fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
          <path d="M16 40v8h32v-8" fill={color} />
        </svg>
      );
    case "firstaid":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <rect x="14" y="14" width="36" height="36" rx="8" fill={color} />
          <path d="M32 22v20M22 32h20" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case "calm":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <circle cx="32" cy="32" r="16" fill="none" stroke={color} strokeWidth="3" />
          <path d="M20 34c4 6 20 6 24 0" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx="26" cy="28" r="2.5" fill={color} />
          <circle cx="38" cy="28" r="2.5" fill={color} />
        </svg>
      );
    case "bridge":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <path d="M10 40c8-16 36-16 44 0" fill="none" stroke={color} strokeWidth="3" />
          <path d="M14 40v8M50 40v8M32 28v20" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "circuit":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.2" />
          <circle cx="20" cy="32" r="5" fill={color} />
          <circle cx="44" cy="32" r="5" fill={color} />
          <path d="M25 32h14M32 20v8M32 36v8" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="18" r="3" fill={color} />
          <circle cx="32" cy="46" r="3" fill={color} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill={color} opacity="0.25" />
          <circle cx="32" cy="32" r="14" fill={color} />
        </svg>
      );
  }
}
