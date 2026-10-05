export function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.72 5.28l-1.7 1.7M6.98 17.02l-1.7 1.7M18.72 18.72l-1.7-1.7M6.98 6.98l-1.7-1.7" />
    </svg>
  )
}

export function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M20 15.2A8.8 8.8 0 1 1 8.8 4a7.2 7.2 0 0 0 11.2 11.2Z" />
    </svg>
  )
}

export function WalletIcon(props) {
  return (
    <i
      className={`fa-solid fa-chart-line ${props.className || ''}`}
      aria-hidden="true"
    />
  )
}

export function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3l7 3v5c0 4.5-2.8 7.9-7 10-4.2-2.1-7-5.5-7-10V6l7-3Z" />
      <path d="m9.2 12.2 1.9 1.9 3.8-4.2" />
    </svg>
  )
}

export function ChartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 19.5h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5.5" />
      <path d="M17 16v-7" />
    </svg>
  )
}

export function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .7a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.8 1.2 1.8 1.2 1 .1 1.8.2 2.2.2 1 0 1.7-.7 2.1-1.3-2.7-.3-5.5-1.4-5.5-6a4.7 4.7 0 0 1 1.2-3.2 4.3 4.3 0 0 1 .1-3.2s1-.3 3.3 1.2a11.2 11.2 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2a4.3 4.3 0 0 1 .1 3.2 4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.3v3.4c0 .3.2.7.8.6A12 12 0 0 0 12 .7Z" />
    </svg>
  )
}

export function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5A2.48 2.48 0 1 0 5 8.46 2.48 2.48 0 0 0 4.98 3.5ZM3 9.75h4v11.5H3ZM9.5 9.75h3.83v1.57h.05c.53-1 1.84-2.05 3.79-2.05 4.05 0 4.8 2.67 4.8 6.15v6.83h-4V16.2c0-1.44-.03-3.3-2.02-3.3-2.02 0-2.33 1.57-2.33 3.2v6.15h-4Z" />
    </svg>
  )
}

export function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.3-8.3L1 2h6.2l4.3 5.7L18.9 2Zm-1.1 18h1.7L5.2 3.9H3.4Z" />
    </svg>
  )
}

export function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  )
}

export function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 6.5h16v11H4z" />
      <path d="m5 7 7 6 7-6" />
    </svg>
  )
}

export function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8.5a4 4 0 1 1 8 0V11" />
    </svg>
  )
}
