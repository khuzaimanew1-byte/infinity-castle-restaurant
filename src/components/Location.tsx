"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { siteSettings } from "@/data/site";

const INFO_CARDS = [
  {
    jp: "営業", label: "Hours",
    content: (
      <>
        <p className="mt-3 font-display text-3xl leading-none text-ink">
          {siteSettings.hours.open} – {siteSettings.hours.close}
        </p>
        <p className="mt-2 text-xs uppercase tracking-widest text-ink-faint">Open daily</p>
      </>
    ),
  },
  {
    jp: "連絡", label: "Contact",
    content: (
      <div className="mt-3 flex flex-col gap-3">
        <a
          href={`tel:${siteSettings.contact.phoneDialable}`}
          className="group flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-[0.7rem] text-metal-lit transition-colors group-hover:border-wisteria/30 group-hover:text-wisteria">
            ☎
          </span>
          {siteSettings.contact.phone}
        </a>
        <a
          href={siteSettings.contact.whatsappUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-[0.7rem] text-metal-lit transition-colors group-hover:border-[#25D366]/40 group-hover:text-[#25D366]">
            ✉
          </span>
          WhatsApp
        </a>
      </div>
    ),
  },
  {
    jp: "社会", label: "Social",
    content: (
      <div className="mt-3 flex flex-col gap-3">
        <a
          href={siteSettings.social.instagram}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-[0.7rem] text-metal-lit transition-colors group-hover:border-pink-500/40 group-hover:text-pink-400">
            ◉
          </span>
          {siteSettings.social.instagramHandle}
        </a>
        <a
          href={siteSettings.social.tiktok}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-[0.7rem] text-metal-lit transition-colors group-hover:border-sky-400/40 group-hover:text-sky-400">
            ▷
          </span>
          {siteSettings.social.tiktokHandle}
        </a>
      </div>
    ),
  },
];

export default function Location() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="location"
      ref={ref}
      className="relative border-t border-line bg-timber"
      aria-label="Find Us"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 60% at 20% 50%, rgba(137,97,217,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="shell section-y">
        {/* Header */}
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="jp text-xs text-metal-lit">五</span>
            <span className="h-px w-6 bg-gradient-to-r from-metal-lit to-transparent" />
            <span className="text-[0.65rem] uppercase tracking-[0.28em] text-ink-faint">
              <span className="jp mr-2 text-metal-lit">場</span>Find Us
            </span>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium leading-[1.04] text-ink">
              Come find the Castle
            </h2>
            <p className="max-w-xs text-sm text-ink-soft">
              {siteSettings.address.line1},{" "}
              {siteSettings.address.line2},{" "}
              {siteSettings.address.city}
            </p>
          </div>
        </div>

        <div
          className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
          }}
        >
          {/* ── Map embed (no API key — standard embed URL) ── */}
          <div className="overflow-hidden rounded-[1.1rem] border border-line bg-void">
            <iframe
              title="Infinity Castle Dining — map"
              width="100%"
              height="400"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${siteSettings.address.lat},${siteSettings.address.lng}&hl=en&z=15&output=embed`}
              className="block w-full"
              style={{
                border: 0,
                /* Dark-mode filter to match site palette */
                filter:
                  "invert(92%) hue-rotate(180deg) saturate(0.55) brightness(0.88)",
              }}
            />
          </div>

          {/* ── Info sidebar ── */}
          <div className="flex flex-col gap-4">
            {INFO_CARDS.map((card) => (
              <div
                key={card.label}
                className="glass rounded-[1.1rem] border border-line p-5 transition-colors duration-300 hover:border-wisteria/20"
              >
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
                  <span className="jp mr-2 text-metal-lit">{card.jp}</span>
                  {card.label}
                </p>
                {card.content}
              </div>
            ))}

            {/* Directions CTA */}
            <a
              href={siteSettings.address.directionsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center justify-center gap-3 rounded-pill border border-wisteria/30 py-4 text-sm uppercase tracking-widest text-wisteria transition-all duration-300 hover:bg-wisteria/8 hover:border-wisteria/50"
            >
              <span className="jp text-[0.65rem]">道案内</span>
              Get Directions
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
