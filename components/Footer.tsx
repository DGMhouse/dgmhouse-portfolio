import { mono, sans } from "./fonts";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/dgm_house",
    icon: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/916360344703",
    icon: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.6a8.5 8.5 0 1 1 16.3-3.9Z" />
        <path d="M9 8.5c.3 2.5 2.5 4.7 5 5l1-1.1-1.8-1-.8.6a3.3 3.3 0 0 1-1.9-1.9l.6-.8-1-1.8L9 8.5Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61596564244586&mibextid=wwXIfr",
    icon: (
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v1.9H7v3.1h2.8v8h3.7Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#09090c]">
      <div className={`${sans.className} mx-auto max-w-7xl px-5 py-9 sm:px-8`}>
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a href="#top" className="block h-8 w-44" aria-label="DGM HOUSE, back to top">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="DGM HOUSE" className="h-full w-full object-cover" />
            </a>
            <p className="mt-2 text-sm text-neutral-400">
              Websites, apps and software built around your business.
            </p>
          </div>

          <div>
            <p className={`${mono.className} mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500`}>
              Find us online
            </p>
            <ul className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-colors hover:border-[#c6ff2e]/50 hover:text-[#c6ff2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6ff2e]"
                  >
                    <span className="h-[18px] w-[18px]">{icon}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/[0.08] pt-5">
          <p className="text-xs text-neutral-500">
            © 2026 DGM HOUSE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
