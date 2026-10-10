import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-white">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="9" className="fill-brand-700 dark:fill-brand-500" />
        <path d="M8 17.5c2.5 0 3.2-5 5.2-5s2.3 8 4.6 8 2.6-6.5 4.7-6.5c1 0 1.6.8 1.9 1.5" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="whitespace-nowrap">VITALORA</span>
    </Link>
  );
}
