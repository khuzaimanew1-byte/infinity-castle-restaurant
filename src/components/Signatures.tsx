"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { signatures } from "@/data/menu";
import { characters } from "@/data/characters";

export default function Signatures() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-line bg-void py-20"
      aria-label="Signature Dishes"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,147,90,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="shell">
        {/* Header */}
        <div
          className="text-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <p className="jp text-[0.65rem] tracking-[0.4em] text-lantern">
            看板メニュー
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,3.8vw,3rem)] font-medium text-ink">
            House Signatures
          </h2>
          <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-lantern to-transparent" />
        </div>

        {/* Horizontal scroll on mobile, wrap on desktop */}
        <div
          className="no-scrollbar mt-12 flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-5"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
          }}
        >
          {signatures.map((item, i) => {
            const character = item.characterId
              ? characters.find((c) => c.id === item.characterId)
              : null;

            return (
              <div
                key={item.id}
                className="group relative flex shrink-0 w-52 flex-col overflow-hidden rounded-[1.1rem] border border-line bg-surface transition-all duration-500 hover:-translate-y-2 md:w-auto"
                style={{
                  transitionDelay: `${i * 50}ms`,
                  boxShadow: "0 2px 12px -4px rgba(0,0,0,0.5)",
                }}
              >
                {/* Inner glow on hover */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[1.1rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    boxShadow: `inset 0 0 32px rgba(212,147,90,0.08)`,
                    border: "1px solid rgba(212,147,90,0.2)",
                  }}
                />

                {/* Image placeholder */}
                <div
                  className="relative h-36 w-full overflow-hidden"
                  style={{
                    background: character
                      ? `radial-gradient(ellipse at 40% 60%, ${character.themeColor}25 0%, var(--color-void) 70%)`
                      : "radial-gradient(ellipse at 40% 60%, rgba(212,147,90,0.15) 0%, var(--color-void) 70%)",
                  }}
                >
                  {/* Large decorative kanji */}
                  <span
                    className="jp absolute inset-0 flex select-none items-center justify-center font-display text-5xl font-bold opacity-[0.08] transition-all duration-500 group-hover:opacity-[0.14] group-hover:scale-110"
                    style={{ color: character?.themeColor ?? "var(--color-lantern)" }}
                  >
                    {item.name.slice(0, 1)}
                  </span>

                  {/* Signature ribbon */}
                  <div className="absolute left-0 top-4 flex items-center gap-1.5 rounded-r-full border border-lantern/30 bg-void/80 pl-3 pr-4 py-1 backdrop-blur-sm">
                    <span className="inline-block h-1 w-1 rounded-full bg-lantern" />
                    <span className="text-[0.55rem] uppercase tracking-[0.2em] text-lantern">Signature</span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent" />
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  {character && (
                    <span
                      className="mb-1 block text-[0.58rem] uppercase tracking-widest"
                      style={{ color: character.themeColor }}
                    >
                      {character.element}
                    </span>
                  )}
                  <h3 className="font-display text-base font-medium leading-tight text-ink">
                    {item.name}
                  </h3>
                  <span className="mt-3 font-display text-xl tracking-tight text-lantern">
                    Rs {item.price.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#menu"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink"
          >
            <span className="jp text-[0.65rem] text-metal-lit">品</span>
            View full menu
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
