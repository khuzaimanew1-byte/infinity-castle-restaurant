"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { siteSettings } from "@/data/site";

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
      <div className="shell section-y">
        {/* Header */}
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div className="flex items-center gap-4">
            <span className="jp text-sm text-metal-lit">五</span>
            <span className="h-px w-8 bg-gradient-to-r from-metal-lit to-transparent" />
            <p className="text-xs uppercase tracking-[0.24em] text-ink-faint">
              <span className="jp mr-2 text-metal-lit">場</span>Find Us
            </p>
          </div>
          <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium text-ink">
            Come find the Castle
          </h2>
          <p className="mt-4 max-w-md text-ink-soft">
            {siteSettings.address.full}
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Map embed */}
          <div className="overflow-hidden rounded-card border border-line">
            <iframe
              title="Infinity Castle Dining location"
              width="100%"
              height="380"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${siteSettings.address.lat},${siteSettings.address.lng}&zoom=15`}
              className="block w-full"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) saturate(0.7)" }}
            />
          </div>

          {/* Info cards */}
          <div className="flex flex-col gap-4">
            {/* Hours */}
            <div className="glass rounded-card border border-line p-6">
              <p className="text-xs uppercase tracking-widest text-ink-faint">
                <span className="jp mr-2 text-metal-lit">営業</span>Hours
              </p>
              <p className="mt-3 font-display text-3xl text-ink">
                {siteSettings.hours.open} – {siteSettings.hours.close}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-ink-faint">Open daily</p>
            </div>

            {/* Contact */}
            <div className="glass rounded-card border border-line p-6">
              <p className="text-xs uppercase tracking-widest text-ink-faint">
                <span className="jp mr-2 text-metal-lit">連絡</span>Contact
              </p>
              <div className="mt-3 flex flex-col gap-3">
                <a
                  href={`tel:${siteSettings.contact.phoneDialable}`}
                  className="flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  <span className="text-metal-lit">☎</span>
                  {siteSettings.contact.phone}
                </a>
                <a
                  href={siteSettings.contact.whatsappUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  <span className="text-metal-lit">💬</span>
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="glass rounded-card border border-line p-6">
              <p className="text-xs uppercase tracking-widest text-ink-faint">
                <span className="jp mr-2 text-metal-lit">社会</span>Social
              </p>
              <div className="mt-3 flex flex-col gap-3">
                <a
                  href={siteSettings.social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  <span className="text-metal-lit">◉</span>
                  {siteSettings.social.instagramHandle}
                </a>
                <a
                  href={siteSettings.social.tiktok}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  <span className="text-metal-lit">▷</span>
                  {siteSettings.social.tiktokHandle}
                </a>
              </div>
            </div>

            {/* Directions CTA */}
            <a
              href={siteSettings.address.directionsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center justify-center gap-3 rounded-pill border border-wisteria/30 py-4 text-sm uppercase tracking-widest text-wisteria transition-all duration-300 hover:bg-wisteria/10"
            >
              <span className="jp text-[0.65rem]">道案内</span>
              Get Directions
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
