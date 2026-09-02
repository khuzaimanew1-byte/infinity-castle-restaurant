import { siteSettings } from "@/data/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-void py-12" aria-label="Footer">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-[1fr_auto]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 32 32"
                className="size-6 shrink-0"
                aria-hidden="true"
                fill="none"
              >
                <circle cx="16" cy="16" r="14.5" stroke="var(--color-wisteria)" strokeWidth="1.4" />
                <circle cx="16" cy="16" r="10.5" stroke="var(--color-metal)" strokeWidth="0.8" opacity="0.5" />
                <text
                  x="16" y="21.5" textAnchor="middle"
                  fontSize="14" fontFamily="var(--font-noto-jp)"
                  fill="var(--color-ink)"
                >
                  無
                </text>
              </svg>
              <span className="font-display text-sm tracking-tight text-ink">
                Infinity Castle Dining
              </span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-faint">
              {siteSettings.address.full}
            </p>
            <p className="mt-1 text-xs text-ink-faint">{siteSettings.hours.label}</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-4 md:flex-col md:items-end">
            <a href="#story"      className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink">About</a>
            <a href="#menu"       className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink">Menu</a>
            <a href="#characters" className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink">The Cast</a>
            <a href="#reservation"className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink">Reserve</a>
            <a href="#location"   className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink">Find Us</a>
          </nav>
        </div>

        {/* Bottom row */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <p className="text-xs text-ink-faint">
            © {year} Infinity Castle Dining · Bahawalpur
          </p>
          <div className="flex items-center gap-4">
            <a
              href={siteSettings.social.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink"
            >
              Instagram
            </a>
            <a
              href={siteSettings.social.tiktok}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink"
            >
              TikTok
            </a>
            <a
              href={siteSettings.contact.whatsappUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs uppercase tracking-widest text-ink-faint hover:text-ink"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
