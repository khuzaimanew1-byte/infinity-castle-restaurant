"use client";
import { useState, useEffect } from "react";
import { siteSettings } from "@/data/site";

const navLinks = [
  { href: "#story",      label: "About",    jp: "店" },
  { href: "#menu",       label: "Menu",     jp: "品" },
  { href: "#characters", label: "The Cast", jp: "柱" },
  { href: "#location",   label: "Find Us",  jp: "場" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 transition-all duration-500"
        aria-label="Site navigation"
      >
        <div
          className={`
            relative mx-auto flex h-[4.5rem] max-w-5xl items-center
            justify-between gap-6 overflow-hidden rounded-full px-6
            transition-all duration-500 md:px-8
            ${scrolled
              ? "glass border border-line/60 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.7)]"
              : "border border-transparent bg-transparent"
            }
          `}
        >
          {/* Logo */}
          <a href="#top" className="flex items-center gap-3 group">
            <svg
              viewBox="0 0 32 32"
              className="size-7 shrink-0 transition-transform duration-500 group-hover:rotate-12"
              aria-hidden="true"
              fill="none"
            >
              <circle cx="16" cy="16" r="14.5" stroke="var(--color-wisteria)" strokeWidth="1.4" />
              <circle cx="16" cy="16" r="10.5" stroke="var(--color-metal)" strokeWidth="0.8" opacity="0.6" />
              <text
                x="16" y="21.5" textAnchor="middle"
                fontSize="15" fontFamily="var(--font-noto-jp)"
                fill="var(--color-ink)"
              >
                無
              </text>
            </svg>
            <span className="font-display text-[0.98rem] leading-none tracking-tight text-ink sm:text-[1.05rem]">
              Infinity Castle Dining
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative flex items-center gap-2 py-1 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink"
              >
                <span className="jp text-[0.7rem] text-metal opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {link.jp}
                </span>
                {link.label}
                <span className="absolute inset-x-0 -bottom-1 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-wisteria to-transparent transition-transform duration-500 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <a
              href={`tel:${siteSettings.contact.phoneDialable}`}
              className="rounded-full border border-ink/20 px-5 py-2 text-xs uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink/45 hover:text-ink"
            >
              Call
            </a>
            <a
              href="#reservation"
              className="group relative overflow-hidden rounded-full bg-wisteria px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
              <span className="relative z-10">Reserve</span>
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex size-9 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`h-px w-5 bg-ink transition-transform duration-300 ${mobileOpen ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-5 bg-ink transition-transform duration-300 ${mobileOpen ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>

          {/* Scroll progress bar */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
            style={{
              background: "linear-gradient(90deg, var(--color-wisteria), var(--color-flame))",
              width: `${scrollPct}%`,
              transition: "width 0.1s linear",
              boxShadow: "0 0 8px var(--color-wisteria)",
            }}
          />
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-timber px-6 pt-28 pb-12 transition-all duration-500 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-1">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="group flex items-center gap-4 border-b border-line py-5 text-2xl font-display text-ink transition-colors hover:text-wisteria"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="jp text-sm text-metal">{link.jp}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-3">
          <a
            href={siteSettings.contact.whatsappUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => setMobileOpen(false)}
            className="w-full rounded-full bg-wisteria py-4 text-center text-sm font-medium uppercase tracking-widest text-white"
          >
            Reserve on WhatsApp
          </a>
          <a
            href={`tel:${siteSettings.contact.phoneDialable}`}
            onClick={() => setMobileOpen(false)}
            className="w-full rounded-full border border-line py-4 text-center text-sm uppercase tracking-widest text-ink-soft"
          >
            {siteSettings.contact.phone}
          </a>
        </div>
      </div>
    </>
  );
}
