"use client";
import { useState, useRef, useCallback } from "react";
import { useInView } from "framer-motion";
import { categories, menuItems, type MenuItem } from "@/data/menu";
import { characters } from "@/data/characters";

// Premium food placeholder — dark themed gradient with category icon
function FoodPlaceholder({ name, color }: { name: string; color?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at 40% 40%, ${color ?? "rgba(137,97,217,0.15)"} 0%, rgba(26,20,16,0.6) 70%)`,
      }}
    >
      <span
        className="jp select-none font-display text-3xl font-medium opacity-30"
        style={{ color: color ?? "var(--color-wisteria)" }}
      >
        {initials}
      </span>
    </div>
  );
}

function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  const character = item.characterId
    ? characters.find((c) => c.id === item.characterId)
    : null;
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${index * 0.06}s, transform 0.6s ease ${index * 0.06}s`,
      }}
    >
      <div
        className={`
          group relative flex flex-col overflow-hidden rounded-[1.1rem] border
          bg-surface transition-all duration-500 hover:-translate-y-1.5
          ${hovered && character ? "" : "border-line"}
        `}
        style={
          hovered && character
            ? {
                borderColor: `${character.themeColor}40`,
                boxShadow: `0 0 0 1px ${character.themeColor}20, 0 20px 48px -16px ${character.themeColor}30`,
              }
            : { boxShadow: "0 2px 12px -4px rgba(0,0,0,0.4)" }
        }
      >
        {/* Top accent bar */}
        <div
          className="absolute inset-x-0 top-0 z-10 h-[2px] transition-all duration-500"
          style={{
            background: character
              ? `linear-gradient(90deg, transparent 0%, ${character.themeColor}${hovered ? "cc" : "55"} 50%, transparent 100%)`
              : `linear-gradient(90deg, transparent 0%, var(--color-lantern)${hovered ? "60" : "20"} 50%, transparent 100%)`,
          }}
        />

        {/* Image area */}
        <div className="relative h-44 w-full overflow-hidden bg-void/80">
          <FoodPlaceholder
            name={item.name}
            color={character?.themeColor ?? (item.isSignature ? "rgba(212,147,90,0.25)" : undefined)}
          />
          {/* Gradient fade bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />

          {/* Signature badge */}
          {item.isSignature && (
            <div className="absolute left-3 top-3">
              <span className="flex items-center gap-1.5 rounded-full border border-lantern/40 bg-void/70 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-lantern backdrop-blur-sm">
                <span className="inline-block h-1 w-1 rounded-full bg-lantern" />
                Signature
              </span>
            </div>
          )}

          {/* Character avatar area */}
          {character && (
            <div
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-sm transition-all duration-300"
              style={{
                borderColor: `${character.themeColor}50`,
                background: `${character.themeColor}15`,
                opacity: hovered ? 1 : 0.75,
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: character.themeColor, boxShadow: `0 0 5px ${character.themeColor}` }}
              />
              <span className="jp text-[0.58rem] tracking-widest" style={{ color: character.themeColor }}>
                {character.japaneseTitle}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Character info */}
          {character && (
            <p className="mb-2 text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
              {character.element} Breathing · {character.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-display text-[1.05rem] font-medium leading-tight text-ink transition-colors duration-300 group-hover:text-white">
            {item.name}
          </h3>

          {/* Price row */}
          <div className="mt-auto flex items-end justify-between pt-4">
            <span
              className="font-display text-[1.4rem] leading-none tracking-tight transition-all duration-300"
              style={{
                color: hovered
                  ? (character?.themeColor ?? "var(--color-lantern)")
                  : "var(--color-lantern)",
                textShadow: hovered && character ? `0 0 20px ${character.themeColor}80` : "none",
              }}
            >
              Rs {item.price.toLocaleString()}
            </span>

            {/* Arrow */}
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300"
              style={{
                borderColor: hovered ? (character?.themeColor ?? "var(--color-wisteria)") + "50" : "var(--color-line)",
                color: hovered ? (character?.themeColor ?? "var(--color-wisteria)") : "var(--color-ink-faint)",
              }}
            >
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[1.1rem] border border-line bg-surface overflow-hidden">
      <div className="skeleton h-44 w-full" />
      <div className="p-5">
        <div className="skeleton mb-3 h-3 w-24 rounded" />
        <div className="skeleton h-5 w-40 rounded" />
        <div className="skeleton mt-5 h-6 w-20 rounded" />
      </div>
    </div>
  );
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const filtered = menuItems.filter((item) => item.category === activeCategory);

  const scrollTabIntoView = useCallback((id: string) => {
    setActiveCategory(id);
  }, []);

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="relative border-t border-line bg-void"
      aria-label="Menu"
    >
      {/* Subtle top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(137,97,217,0.4), transparent)" }}
      />

      <div className="shell section-y">
        {/* Section header */}
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(24px)",
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
            <p className="max-w-xs text-sm text-ink-soft">
              Character-tagged dishes carry the breathing style of their Hashira
              or demon. Hover to see it.
            </p>
          </div>
        </div>

        {/* Category tabs — no-scrollbar, app-like */}
        <div
          className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-px"
          role="tablist"
          aria-label="Menu categories"
          style={{
            opacity: inView ? 1 : 0,
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
                onClick={() => scrollTabIntoView(cat.id)}
                className={`
                  relative flex shrink-0 items-center gap-2 overflow-hidden rounded-pill border
                  px-4 py-2.5 text-[0.68rem] uppercase tracking-[0.2em]
                  transition-all duration-300 focus:outline-none
                  ${isActive
                    ? "border-wisteria/50 text-white"
                    : "border-line text-ink-soft hover:border-ink/25 hover:text-ink"
                  }
                `}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, rgba(137,97,217,0.25) 0%, rgba(137,97,217,0.1) 100%)",
                        boxShadow: "0 0 0 1px rgba(137,97,217,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
                      }
                    : {}
                }
              >
                {isActive && (
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "linear-gradient(180deg, rgba(137,97,217,0.04) 0%, transparent 100%)" }}
                  />
                )}
                <span className="jp text-[0.62rem] opacity-70">{cat.labelJp}</span>
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="tabpanel"
        >
          {filtered.length > 0
            ? filtered.map((item, i) => <MenuCard key={item.id} item={item} index={i} />)
            : Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </section>
  );
}
