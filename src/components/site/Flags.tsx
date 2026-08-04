/** Small, crisp SVG flags used in the site hero. Pure SVG so they stay
 * sharp on every screen and never depend on emoji rendering. */

export function CameroonFlag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} role="img" aria-label="Cameroon flag">
      <rect width="20" height="40" fill="#007a5e" />
      <rect x="20" width="20" height="40" fill="#ce1126" />
      <rect x="40" width="20" height="40" fill="#fcd116" />
      <path
        d="M30 13.5 l2.2 4.46 4.92.72-3.56 3.47.84 4.9L30 24.86l-4.4 2.31.84-4.9-3.56-3.47 4.92-.72z"
        fill="#fcd116"
      />
    </svg>
  );
}

export function UkFlag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} role="img" aria-label="United Kingdom flag">
      <clipPath id="uk-clip">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-clip)" />
      <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}
