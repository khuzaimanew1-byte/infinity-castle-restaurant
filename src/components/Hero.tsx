"use client";
import { useEffect, useRef, useState } from "react";
import { siteSettings } from "@/data/site";

const EMBERS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: 1.2 + Math.random() * 2.8,
  duration: 11 + Math.random() * 13,
  delay: Math.random() * 16,
  drift: (Math.random() - 0.5) * 70,
  opacity: 0.5 + Math.random() * 0.5,
}));

const STATS = [
  { jp: "評価", label: "Rated",    value: "4.7 / 5"        },
  { jp: "場所", label: "Where",    value: "Bahawalpur"      },
  { jp: "予算", label: "Per head", value: "Rs 1,000–2,000" },
  { jp: "営業", label: "Open",     value: "10:00 – 23:30"  },
];

const WORDS = ["A", "Demon", "Slayer", "themed", "Japanese", "kitchen", "in", "Bahawalpur"];

export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── Mouse parallax — track relative position inside hero ── */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      // Normalize -0.5 to 0.5
      setMouse({
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      });
    };
    hero.addEventListener("mousemove", handleMove, { passive: true });
    return () => hero.removeEventListener("mousemove", handleMove);
  }, []);

  const px = mouse.x;
  const py = mouse.y;

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative isolate min-h-[100svh] overflow-hidden bg-void"
      aria-label="Hero"
    >
      {/* ── Deep multi-layer background — parallax layer 1 (slow) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-transform duration-[1200ms] ease-out"
        style={{
          transform: `translate(${px * -18}px, ${py * -12}px)`,
          background: [
            `radial-gradient(ellipse 130% 90% at ${60 + px * 8}% ${40 + py * 8}%, rgba(137,97,217,0.1) 0%, transparent 55%)`,
            `radial-gradient(ellipse 90% 70% at ${10 + px * 5}% ${80 + py * 5}%, rgba(232,117,58,0.07) 0%, transparent 50%)`,
          ].join(", "),
        }}
      />

      {/* ── Overlay darkening — stays fixed ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(165deg, rgba(11,9,6,0.97) 0%, rgba(11,9,6,0.80) 35%, rgba(11,9,6,0.30) 65%, rgba(11,9,6,0.04) 100%)",
            "linear-gradient(0deg, rgba(11,9,6,0.97) 0%, rgba(11,9,6,0.5) 18%, transparent 40%)",
            "linear-gradient(180deg, rgba(11,9,6,0.72) 0%, transparent 22%)",
          ].join(", "),
        }}
      />

      {/* ── Wisteria lattice — parallax layer 2 (medium) ── */}
      <div
        aria-hidden="true"
        className="wisteria-lattice pointer-events-none absolute inset-0 transition-transform duration-[900ms] ease-out"
        style={{
          transform: `translate(${px * -10}px, ${py * -7}px)`,
        }}
      />

      {/* ── Vertical rule lines ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03]">
        {[15, 30, 50, 68, 82].map((pct) => (
          <div
            key={pct}
            className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-wisteria to-transparent"
            style={{ left: `${pct}%` }}
          />
        ))}
      </div>

      {/* ── Ember particles — parallax layer 3 (fast) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden transition-transform duration-[600ms] ease-out"
        style={{
          transform: `translate(${px * -28}px, ${py * -16}px)`,
        }}
      >
        {EMBERS.map((e) => (
          <span
            key={e.id}
            className="ember"
            style={{
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              opacity: e.opacity,
              "--duration": `${e.duration}s`,
              "--delay": `${e.delay}s`,
              "--drift": `${e.drift}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Coordinates side label ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-5 hidden items-center xl:flex"
      >
        <div className="flex flex-col items-center gap-5">
          <span className="h-28 w-px bg-gradient-to-b from-transparent via-ink-faint/25 to-transparent" />
          <span
            className="jp text-[0.6rem] tracking-[0.35em] text-ink-faint"
            style={{ writingMode: "vertical-rl" }}
          >
            {siteSettings.address.lat}°N &nbsp;·&nbsp; {siteSettings.address.lng}°E
          </span>
          <span className="h-28 w-px bg-gradient-to-b from-transparent via-ink-faint/25 to-transparent" />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="shell relative flex min-h-[100svh] flex-col justify-end pb-16 pt-36 md:pb-24 md:pt-48">

        {/* Eyebrow */}
        <div
          className="flex items-center gap-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.8s ease 0.05s, transform 0.8s ease 0.05s",
          }}
        >
          <span aria-hidden="true" className="block h-px w-12 bg-gradient-to-r from-transparent via-wisteria to-wisteria/30" />
          <p className="jp text-[0.72rem] tracking-[0.38em] text-wisteria">
            無限城 &nbsp;·&nbsp; Infinity Castle
          </p>
        </div>

        {/* Headline — staggered words */}
        <h1 className="mt-6 max-w-[22ch] font-display text-[clamp(2.4rem,5.8vw,5.2rem)] font-medium leading-[1.01] tracking-[-0.025em] text-ink">
          {WORDS.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <span
                className="inline-block mr-[0.22em]"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(48px)",
                  transition: `opacity 0.75s cubic-bezier(0.22,1,0.36,1) ${0.14 + i * 0.07}s,
                               transform 0.75s cubic-bezier(0.22,1,0.36,1) ${0.14 + i * 0.07}s`,
                }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        {/* Subtext + CTAs */}
        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.8s ease 0.55s, transform 0.8s ease 0.55s",
            }}
          >
            <p className="max-w-md text-[1.05rem] leading-[1.8] text-ink-soft">
              Steaks, stone-fired pizza, wings and shakes.{" "}
              <span className="text-ink/80">Every dish named for a Hashira or a demon.</span>{" "}
              Open daily until{" "}
              <span className="font-medium text-lantern">{siteSettings.hours.close}</span>.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#menu"
                className="group relative isolate inline-flex items-center gap-3 overflow-hidden rounded-pill bg-wisteria px-8 py-[0.9rem] text-sm font-medium tracking-wide text-white shadow-[0_2px_0_rgba(0,0,0,0.3),0_12px_32px_-8px_rgba(137,97,217,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_0_rgba(0,0,0,0.25),0_16px_40px_-8px_rgba(137,97,217,0.6)]"
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                <span className="relative z-10">View the Menu</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>

              <a
                href={siteSettings.contact.whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-3 rounded-pill border border-white/15 px-8 py-[0.9rem] text-sm font-medium text-ink backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-wisteria/40 hover:bg-wisteria/5"
              >
                Reserve on WhatsApp
                <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
              </a>
            </div>
          </div>

          {/* Scroll cue */}
          <a
            href="#story"
            aria-label="Scroll to About"
            className="group hidden flex-col items-center gap-3 lg:flex"
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 1s ease 1s",
            }}
          >
            <span className="jp text-[0.6rem] tracking-[0.32em] text-ink-faint transition-colors duration-300 group-hover:text-ink-soft">
              下へ
            </span>
            <span className="relative block h-16 w-px overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-faint/30 to-transparent" />
              <span
                className="absolute inset-x-0 h-6 rounded-full bg-gradient-to-b from-wisteria/70 to-wisteria"
                style={{ animation: "scroll-cue 2.6s ease-in-out infinite" }}
              />
            </span>
          </a>
        </div>

        {/* Stats strip */}
        <div
          className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease 0.75s, transform 0.8s ease 0.75s",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-[0.9rem] border border-white/[0.07] bg-white/[0.03] px-5 py-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-wisteria/20 hover:bg-white/[0.05]"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
              <span className="jp block text-[0.6rem] tracking-[0.28em] text-metal-lit">{s.jp}</span>
              <span className="mt-2 block font-display text-[1.35rem] leading-none tracking-tight text-ink">
                {s.value}
              </span>
              <span className="mt-2 block text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
