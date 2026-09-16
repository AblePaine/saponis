export function BrandMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <path
        d="M10 20c0-5 6-9 6-13 0 4 6 8 6 13 0 3.3-2.7 6-6 6s-6-2.7-6-6z"
        fill="currentColor"
        className="text-primary-fg"
      />
      <path
        d="M16 9c.4 2.2-.2 4-1.4 5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className="text-primary"
        strokeLinecap="round"
      />
    </svg>
  );
}
