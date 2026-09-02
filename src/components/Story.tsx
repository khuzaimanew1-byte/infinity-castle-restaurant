"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { siteSettings } from "@/data/site";

function RevealBlock({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const facts = [
  { label: "Opened",    value: siteSettings.openedOn,         jp: "開業" },
  { label: "Rating",    value: `${siteSettings.rating} / 5`,  jp: "評価" },
  { label: "Hours",     value: siteSettings.hours.label,      jp: "営業" },
  { label: "Price",     value: siteSettings.priceRange.label, jp: "予算" },
];

export default function Story() {
  return (
    <section
      id="story"
      className="relative overflow-hidden border-t border-line bg-timber"
      aria-label="About"
    >
      {/* Background radials */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-[44rem] w-[44rem]"
        style={{
          background:
            "radial-gradient(50% 50% at 80% 15%, rgba(137,97,217,0.09) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[30rem] w-[30rem]"
        style={{
          background:
            "radial-gradient(50% 50% at 10% 90%, rgba(232,117,58,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Vertical decorative rule */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[8%] hidden w-px xl:block"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(137,97,217,0.12) 30%, rgba(137,97,217,0.12) 70%, transparent)",
        }}
      />

      <div className="shell section-y">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-28">
          {/* Left — copy */}
          <div>
            <RevealBlock>
              <div className="flex items-center gap-3">
                <span className="jp text-xs text-metal-lit">壱</span>
                <span className="h-px w-6 bg-gradient-to-r from-metal-lit to-transparent" />
                <span className="text-[0.65rem] uppercase tracking-[0.28em] text-ink-faint">
                  <span className="jp mr-2 text-metal-lit">店</span>The House
                </span>
              </div>
            </RevealBlock>

            <RevealBlock delay={0.1}>
              <h2 className="mt-8 max-w-[28rem] font-display text-[clamp(2rem,4.5vw,3.5rem)] font-medium leading-[1.04] tracking-[-0.02em] text-ink">
                Bahawalpur&apos;s first Demon Slayer dining hall
              </h2>
            </RevealBlock>

            <RevealBlock delay={0.2}>
              <p className="mt-8 max-w-lg text-[1.05rem] leading-[1.85] text-ink-soft">
                We opened on{" "}
                <span className="text-ink">{siteSettings.address.line2}</span> on{" "}
                <span className="font-medium text-ink">{siteSettings.openedOn}</span>{" "}
                and built the room first — hanging wisteria, paper lanterns,
                dark timber, and light kept low enough that the lanterns do the
                work.
              </p>
              <p className="mt-5 max-w-lg leading-[1.85] text-ink-soft">
                Then we built the menu around it. Steaks and stone-fired pizza,
                wings, shakes, and Spanish coffee. Every plate carries a name
                from the series, so ordering is half the experience.
              </p>
            </RevealBlock>

            <RevealBlock delay={0.3}>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="#menu"
                  className="group inline-flex items-center gap-2 rounded-pill border border-wisteria/30 px-6 py-3 text-[0.78rem] uppercase tracking-[0.18em] text-ink-soft transition-all duration-300 hover:border-wisteria/60 hover:bg-wisteria/5 hover:text-ink"
                >
                  Explore the menu
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </a>
                <a
                  href={siteSettings.address.directionsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-center gap-2 rounded-pill border border-line px-6 py-3 text-[0.78rem] uppercase tracking-[0.18em] text-ink-soft transition-all duration-300 hover:border-ink/30 hover:text-ink"
                >
                  Get directions
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </a>
              </div>
            </RevealBlock>
          </div>

          {/* Right — quote + facts */}
          <RevealBlock delay={0.15} className="lg:pt-20">
            {/* Pull quote */}
            <figure className="relative pl-6">
              {/* Left accent line */}
              <div
                className="absolute inset-y-0 left-0 w-px"
                style={{
                  background:
                    "linear-gradient(180deg, var(--color-wisteria), transparent)",
                }}
              />
              <span
                aria-hidden="true"
                className="jp absolute -left-1 -top-4 select-none font-display text-7xl leading-none text-wisteria opacity-20"
              >
                &ldquo;
              </span>
              <blockquote className="font-display text-[clamp(1.4rem,2.4vw,1.9rem)] font-normal italic leading-[1.5] text-ink">
                Every dish is a character. Every order is a story.
              </blockquote>
              <figcaption className="mt-5 text-[0.65rem] uppercase tracking-[0.24em] text-ink-faint">
                Infinity Castle Dining &nbsp;·&nbsp; Est. {siteSettings.openedOn}
              </figcaption>
            </figure>

            {/* Fact grid */}
            <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[1.1rem] border border-line bg-line">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="group relative bg-surface px-5 py-5 transition-colors duration-300 hover:bg-void"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 0%, rgba(137,97,217,0.05) 0%, transparent 70%)",
                    }}
                  />
                  <span className="jp block text-[0.6rem] tracking-[0.28em] text-metal">
                    {f.jp}
                  </span>
                  <span className="mt-1.5 block font-display text-lg leading-tight text-ink">
                    {f.value}
                  </span>
                  <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.2em] text-ink-faint">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}
