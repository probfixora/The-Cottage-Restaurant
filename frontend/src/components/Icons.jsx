// Hand-drawn SVGs that the icon library doesn't cover.

/** The Cottage mark: a double arch, like the hall's doorways. */
export function ArchMark({ className = '', title }) {
  return (
    <svg className={className} viewBox="0 0 40 48" role={title ? 'img' : 'presentation'} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path d="M5 46V20a15 15 0 0 1 30 0v26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12.5 46V22a7.5 7.5 0 0 1 15 0v24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 46h36" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function InstagramIcon({ size = 20, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The Indian vegetarian mark: green square with a green dot. */
export function VegMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="#2f8a3b" strokeWidth="1.6" />
      <circle cx="8" cy="8" r="3.6" fill="#2f8a3b" />
    </svg>
  );
}
