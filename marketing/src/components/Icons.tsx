export function SproutMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21v-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 13c-2.8-1.2-5.2-1-7-.2 1.1-3.4 4-5.2 7-5.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13c2.8-1.2 5.2-1 7-.2-1.1-3.4-4-5.2-7-5.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 7.5C11 4.8 9.2 3.2 7 2.5c1.8 2.2 2.6 3.8 2.8 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type IconName = "compass" | "camera" | "sprout" | "mountain" | "star";

export function Icon({ name }: { name: IconName }) {
  switch (name) {
    case "compass":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="m14.7 9.3-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "camera":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="3.5"
            y="7"
            width="17"
            height="12"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M9 7l1.2-2.2h3.6L15 7"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case "sprout":
      return <SproutMark />;
    case "mountain":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m3.5 17.5 5.2-7.4 3.1 4.2 2.4-3.2 6.3 6.4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.2 9.2 13.8 7l1.7 2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m12 3.8 2.2 4.6 5 .7-3.6 3.5.9 5.1L12 15.4 7.5 17.7l.9-5.1L4.8 9.1l5-.7L12 3.8Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
