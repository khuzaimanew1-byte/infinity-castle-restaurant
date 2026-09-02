"use client";
import { useRef } from "react";
import { useInView, motion } from "framer-motion";
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
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,147,90,0.06) 0%, transparent 70%)",
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

        {/* ── Framer Motion drag carousel ── */}
        <div
          className="mt-12 overflow-hidden"
          style={{
            opacity: inView ? 1 : 0,
            transition: "opacity 0.7s ease 0.2s",
          }}
        >
          <motion.div
            className="flex gap-5 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{
              /* allow dragging the full width of the content minus viewport */
              left: -(signatures.length * 220 - 220),
              right: 0,
            }}
            dragElastic={0.12}
            dragTransition={{ bounceStiffness: 200, bounceDamping: 28 }}
            whileTap={{ cursor: "grabbing" }}
          >
            {signatures.map((item, i) => {
              const character = item.characterId
                ? characters.find((c) => c.id === item.characterId)
                : null;
              const accent =
                character?.themeColor ?? "var(--color-lantern)";

              return (
                <motion.div
                  key={item.id}
                  className="group relative flex w-52 shrink-0 flex-col overflow-hidden rounded-[1.1rem] border border-line bg-surface"
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  style={{
                    boxShadow: "0 2px 12px -4px rgba(0,0,0,0.5)",
                  }}
                  /* Cards tilt slightly while dragging for physical feel */
                  drag={false}
                >
                  {/* Top accent */}
                  <div
                    className="absolute inset-x-0 top-0 h-[2px] opacity-50 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                      boxShadow: `0 0 8px ${accent}`,
                    }}
                  />

                  {/* Image area */}
                  <div
                    className="relative h-36 w-full overflow-hidden"
                    style={{
                      background: `radial-gradient(ellipse at 40% 60%, ${character?.themeColor ?? "rgba(212,147,90,0.15)"}25 0%, var(--color-void) 70%)`,
                    }}
                  >
                    {/* Kanji watermark */}
                    <span
                      aria-hidden="true"
                      className="jp absolute inset-0 flex select-none items-center justify-center font-display text-5xl font-bold transition-all duration-500 group-hover:scale-110"
                      style={{
                        color: accent,
                        opacity: 0.09,
                      }}
                    >
                      {item.name.slice(0, 1)}
                    </span>

                    {/* Signature ribbon */}
                    <div className="absolute left-0 top-3 flex items-center gap-1.5 rounded-r-full border border-lantern/30 bg-void/80 py-1 pl-3 pr-4 backdrop-blur-sm">
                      <span className="inline-block h-1 w-1 rounded-full bg-lantern" />
                      <span className="text-[0.52rem] uppercase tracking-[0.2em] text-lantern">
                        Signature
                      </span>
                    </div>

                    {/* Character tag */}
                    {character && (
                      <div
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-2 py-0.5"
                        style={{
                          background: `${accent}15`,
                          border: `1px solid ${accent}30`,
                        }}
                      >
                        <span
                          className="inline-block h-1 w-1 rounded-full"
                          style={{ background: accent }}
                        />
                        <span
                          className="jp text-[0.52rem] tracking-wide"
                          style={{ color: accent }}
                        >
                          {character.japaneseTitle}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface to-transparent" />
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4">
                    {character && (
                      <span
                        className="mb-1 block text-[0.58rem] uppercase tracking-widest"
                        style={{ color: accent, opacity: 0.85 }}
                      >
                        {character.element} Breathing
                      </span>
                    )}
                    <h3 className="font-display text-base font-medium leading-tight text-ink">
                      {item.name}
                    </h3>
                    <span
                      className="mt-3 block font-display text-xl tracking-tight"
                      style={{ color: accent }}
                    >
                      Rs {item.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Drag-hint index */}
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-void/60 text-[0.52rem] text-ink-faint">
                    {i + 1}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Drag hint */}
          <p className="mt-5 text-center text-[0.6rem] uppercase tracking-[0.28em] text-ink-faint opacity-60">
            ← drag to explore →
          </p>
        </div>

        {/* View full menu */}
        <div className="mt-8 text-center">
          <a
            href="#menu"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink"
          >
            <span className="jp text-[0.65rem] text-metal-lit">品</span>
            View full menu
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
