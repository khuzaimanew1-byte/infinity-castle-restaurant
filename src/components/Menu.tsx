"use client";
import { useState, useRef, useCallback } from "react";
import { useInView } from "framer-motion";
import { categories, menuItems, type MenuItem } from "@/data/menu";
import { characters } from "@/data/characters";

/* ─── Compact horizontal menu card — image RIGHT ─────────────────── */
function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  const character = item.characterId
    ? characters.find((c) => c.id === item.characterId)
    : null;
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  const accent = character?.themeColor ?? (item.isSignature ? "var(--color-lantern)" : "var(--color-line)");

  return (
    <div
      ref={ref}
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.5s ease ${Math.min(index * 0.045, 0.4)}s,
                     transform 0.5s ease ${Math.min(index * 0.045, 0.4)}s`,
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative flex h-[4.5rem] items-center overflow-hidden rounded-[0.85rem] border bg-surface transition-all duration-300"
        style={{
          borderColor: hovered ? `${accent}45` : "var(--color-line)",
          boxShadow:   hovered ? `0 0 0 1px ${accent}18, 0 8px 24px -8px ${accent}20` : "none",
        }}
      >
        {/* Left accent bar */}
        <div
          className="absolute inset-y-0 left-0 w-[2px] transition-all duration-300"
          style={{ background: hovered ? accent : "transparent" }}
        />

        {/* Text block */}
        <div className="flex flex-1 flex-col justify-center gap-0.5 pl-4 pr-3 min-w-0">
          {/* Character or signature tag */}
          {(character || item.isSignature) && (
            <div className="flex items-center gap-1.5">
              {character && (
                <>
                  <span
                    className="inline-block h-1 w-1 shrink-0 rounded-full"
                    style={{ background: accent }}
                  />
                  <span
                    className="jp truncate text-[0.55rem] tracking-[0.18em]"
                    style={{ color: accent, opacity: 0.9 }}
                  >
                    {character.japaneseTitle}
                  </span>
                  <span className="text-[0.52rem] uppercase tracking-widest text-ink-faint truncate">
                    {character.element}
                  </span>
                </>
              )}
              {!character && item.isSignature && (
                <span className="text-[0.52rem] uppercase tracking-[0.18em] text-lantern">
                  Signature
                </span>
              )}
            </div>
          )}

          {/* Dish name */}
          <h3
            className="truncate font-display text-[0.9rem] font-medium leading-tight transition-colors duration-300"
            style={{ color: hovered ? "var(--color-ink)" : "var(--color-ink-soft)" }}
          >
            {item.name}
          </h3>
        </div>

        {/* Price */}
        <div className="shrink-0 px-3 text-right">
          <span
            className="font-display text-base font-medium leading-none transition-all duration-300"
            style={{
              color:      hovered ? accent : "var(--color-lantern)",
              textShadow: hovered ? `0 0 16px ${accent}80` : "none",
            }}
          >
            Rs {item.price.toLocaleString()}
          </span>
        </div>

        {/* Image square — RIGHT */}
        <div
          className="relative h-full w-[4.5rem] shrink-0 overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at 60% 40%, ${character?.themeColor ?? "rgba(212,147,90,0.18)"} 0%, rgba(11,9,6,0.7) 80%)`,
          }}
        >
          {/* Initials watermark */}
          <span
            aria-hidden="true"
            className="jp absolute inset-0 flex select-none items-center justify-center font-display text-2xl font-bold transition-all duration-300"
            style={{
              color:   accent,
              opacity: hovered ? 0.22 : 0.1,
              transform: hovered ? "scale(1.1)" : "scale(1)",
            }}
          >
            {item.name.slice(0, 1)}
          </span>

          {/* Signature ribbon */}
          {item.isSignature && (
            <div
              className="absolute right-0 top-0 h-1 w-full"
              style={{ background: `linear-gradient(90deg, transparent, ${accent})` }}
            />
          )}

          {/* Hover shine sweep */}
          {hovered && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(110deg, transparent 30%, ${accent}12 50%, transparent 70%)`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton row ─────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex h-[4.5rem] items-center gap-3 overflow-hidden rounded-[0.85rem] border border-line bg-surface">
      <div className="flex-1 space-y-2 px-4">
        <div className="skeleton h-2.5 w-16 rounded" />
        <div className="skeleton h-4 w-36 rounded" />
      </div>
      <div className="skeleton mr-3 h-5 w-16 rounded" />
      <div className="skeleton h-full w-[4.5rem]" />
    </div>
  );
}

/* ─── Menu section ─────────────────────────────────────────────────── */
export default function Menu() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const filtered = menuItems.filter((item) => item.category === activeCategory);

  const handleTab = useCallback((id: string) => setActiveCategory(id), []);

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="relative border-t border-line bg-void"
      aria-label="Menu"
    >
      {/* Top wisteria rule */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(137,97,217,0.4), transparent)",
        }}
      />

      <div className="shell section-y">
        {/* Header */}
        <div
          style={{
            opacity:    inView ? 1 : 0,
            transform:  inView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="jp text-xs text-metal-lit">弐</span>
            <span className="h-px w-6 bg-gradient-to-r from-metal-lit to-transparent" />
            <span className="text-[0.65rem] uppercase tracking-[0.28em] text-ink-faint">
              <span className="jp mr-2 text-metal-lit">品</span>The Menu
            </span>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium leading-[1.04] text-ink">
              Every dish, a character
            </h2>
            <p className="max-w-[22rem] text-sm text-ink-soft">
              Character-tagged dishes carry the breathing style of their
              Hashira or demon.
            </p>
          </div>
        </div>

        {/* Category tabs */}
        <div
          className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-px"
          role="tablist"
          aria-label="Menu categories"
          style={{
            opacity:    inView ? 1 : 0,
            transition: "opacity 0.7s ease 0.15s",
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTab(cat.id)}
                className={`
                  relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-pill border
                  px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em]
                  transition-all duration-300 focus:outline-none
                  ${isActive
                    ? "border-wisteria/50 text-white"
                    : "border-line text-ink-soft hover:border-ink/25 hover:text-ink"
                  }
                `}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(137,97,217,0.22) 0%, rgba(137,97,217,0.08) 100%)",
                        boxShadow:
                          "0 0 0 1px rgba(137,97,217,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
                      }
                    : {}
                }
              >
                <span className="jp text-[0.58rem] opacity-60">{cat.labelJp}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Grid: 2 cols on sm+, 3 cols on lg+ ── */}
        <div
          className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
          role="tabpanel"
        >
          {filtered.length > 0
            ? filtered.map((item, i) => (
                <MenuCard key={item.id} item={item} index={i} />
              ))
            : Array.from({ length: 9 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
        </div>
      </div>
    </section>
  );
}
