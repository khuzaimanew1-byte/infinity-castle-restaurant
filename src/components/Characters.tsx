"use client";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { characters, type Character } from "@/data/characters";
import { menuItems } from "@/data/menu";

const hashira   = characters.filter((c) => c.affiliation === "Hashira");
const upperMoon = characters.filter((c) => c.affiliation === "Upper Moon");

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/* ─── Individual card ─────────────────────────────────────────────── */
function CharacterCard({
  character,
  index,
  onHover,
}: {
  character: Character;
  index: number;
  onHover: (c: Character | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const dish   = menuItems.find((m) => m.characterId === character.id);
  const rgb    = hexToRgb(character.themeColor);

  const handleEnter = () => { setHovered(true);  onHover(character); };
  const handleLeave = () => { setHovered(false); onHover(null); };

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        opacity:   inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${Math.min(index * 0.07, 0.5)}s,
                     transform 0.65s ease ${Math.min(index * 0.07, 0.5)}s`,
      }}
    >
      <div
        className="group relative flex flex-col overflow-hidden rounded-[1.1rem] border transition-all duration-500"
        style={{
          borderColor: hovered ? `rgba(${rgb}, 0.35)` : "var(--color-line)",
          background: hovered
            ? `linear-gradient(145deg, rgba(${rgb}, 0.07) 0%, var(--color-surface) 60%)`
            : "var(--color-surface)",
          boxShadow: hovered
            ? `0 0 0 1px rgba(${rgb}, 0.15), 0 20px 48px -16px rgba(${rgb}, 0.28)`
            : "0 2px 12px -4px rgba(0,0,0,0.4)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-[2.5px] transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${character.themeColor}${hovered ? "dd" : "55"}, transparent)`,
            boxShadow:  hovered ? `0 0 12px 2px ${character.themeColor}50` : "none",
          }}
        />

        {/* Art panel */}
        <div
          className="relative h-52 w-full overflow-hidden"
          style={{
            background: `radial-gradient(ellipse 80% 100% at 50% 100%, rgba(${rgb},0.26) 0%, rgba(${rgb},0.06) 50%, var(--color-void) 100%)`,
          }}
        >
          {/* Kanji watermark */}
          <div className="absolute inset-0 flex items-center justify-center select-none" aria-hidden="true">
            <span
              className="jp font-display font-bold leading-none transition-all duration-700"
              style={{
                fontSize:  "clamp(5rem, 10vw, 8rem)",
                color:     character.themeColor,
                opacity:   hovered ? 0.18 : 0.08,
                transform: hovered ? "scale(1.1)" : "scale(1)",
              }}
            >
              {character.japaneseTitle.slice(-1)}
            </span>
          </div>

          {/* Element + affiliation */}
          <div className="absolute bottom-4 left-5 flex items-end gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border"
              style={{
                borderColor: `${character.themeColor}40`,
                background:  `rgba(${rgb}, 0.12)`,
                boxShadow:   hovered ? `0 0 16px 4px rgba(${rgb}, 0.32)` : "none",
                transition:  "box-shadow 0.4s ease",
              }}
            >
              <span className="jp text-base" style={{ color: character.themeColor }}>
                {character.japaneseTitle.slice(-1)}
              </span>
            </div>
            <div className="pb-0.5">
              <span className="block text-[0.58rem] uppercase tracking-[0.22em]" style={{ color: character.themeColor }}>
                {character.affiliation}
              </span>
              <span className="jp block text-[0.65rem] leading-tight tracking-wide text-ink" style={{ opacity: 0.8 }}>
                {character.japaneseTitle}
              </span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent" />
        </div>

        {/* Card body */}
        <div className="flex flex-1 flex-col p-5 pt-4">
          <h3 className="font-display text-xl font-medium leading-tight text-ink">
            {character.name}
          </h3>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint">
            {character.title}
          </p>

          {/* Breathing style pill */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full transition-all duration-300"
              style={{
                background: character.themeColor,
                boxShadow:  hovered ? `0 0 8px 2px ${character.themeColor}` : "none",
              }}
            />
            <span className="text-xs text-ink-soft">{character.element} Breathing</span>
          </div>

          {/* Linked dish */}
          {dish && (
            <div
              className="mt-4 rounded-[0.65rem] border p-4 transition-all duration-300"
              style={{
                borderColor: hovered ? `rgba(${rgb}, 0.28)` : "var(--color-line)",
                background:  hovered ? `rgba(${rgb}, 0.06)` : "rgba(11,9,6,0.5)",
              }}
            >
              <span className="block text-[0.58rem] uppercase tracking-[0.2em] text-ink-faint">
                Signature Dish
              </span>
              <span className="mt-1 block font-display text-[0.95rem] leading-snug text-ink">
                {character.linkedDishName}
              </span>
              <span
                className="mt-1.5 block font-display text-base transition-all duration-300"
                style={{
                  color:      character.themeColor,
                  textShadow: hovered ? `0 0 20px ${character.themeColor}` : "none",
                }}
              >
                Rs {(dish.price ?? 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Section — environment morphs to hovered character's color ───── */
export default function Characters() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeChar, setActiveChar] = useState<Character | null>(null);

  const rgb = activeChar ? hexToRgb(activeChar.themeColor) : null;

  return (
    <section
      id="characters"
      ref={ref}
      className="relative border-t border-line bg-timber overflow-hidden"
      aria-label="The Cast"
    >
      {/* ── Environment background — morphs to hovered character color ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          transition: "background 0.9s ease",
          background: rgb
            ? `radial-gradient(ellipse 70% 55% at 50% 40%, rgba(${rgb},0.09) 0%, transparent 65%)`
            : "radial-gradient(ellipse 55% 45% at 15% 20%, rgba(137,97,217,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Bottom corner glow — always present */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[36rem] w-[36rem]"
        style={{
          background: "radial-gradient(50% 50% at 85% 80%, rgba(232,117,58,0.05) 0%, transparent 70%)",
          transition: "opacity 0.6s ease",
          opacity: activeChar ? 0.3 : 1,
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
            <span className="jp text-xs text-metal-lit">参</span>
            <span className="h-px w-6 bg-gradient-to-r from-metal-lit to-transparent" />
            <span className="text-[0.65rem] uppercase tracking-[0.28em] text-ink-faint">
              <span className="jp mr-2 text-metal-lit">柱</span>The Cast
            </span>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium leading-[1.04] text-ink">
              Nine Hashira &amp; the Upper Moons
            </h2>
            <p className="max-w-xs text-sm text-ink-soft">
              Each character is linked to a dish that channels their breathing
              style — or their darkness.
            </p>
          </div>
        </div>

        {/* Active character ambient label */}
        <div
          className="mt-4 flex h-5 items-center gap-2 overflow-hidden"
          style={{ transition: "opacity 0.4s ease", opacity: activeChar ? 1 : 0 }}
        >
          {activeChar && (
            <>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: activeChar.themeColor }}
              />
              <span
                className="jp text-[0.6rem] tracking-[0.28em]"
                style={{ color: activeChar.themeColor }}
              >
                {activeChar.japaneseTitle}
              </span>
              <span className="text-[0.6rem] uppercase tracking-widest text-ink-faint">
                {activeChar.element} · {activeChar.breathingStyle}
              </span>
            </>
          )}
        </div>

        {/* Hashira divider */}
        <div className="mt-8 flex items-center gap-4">
          <span className="jp text-[0.65rem] tracking-[0.28em] text-metal-lit">九柱</span>
          <div className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
          <span className="text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">The Nine Hashira</span>
        </div>

        {/* Hashira grid */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hashira.map((c, i) => (
            <CharacterCard key={c.id} character={c} index={i} onHover={setActiveChar} />
          ))}
        </div>

        {/* Upper Moon divider */}
        <div className="mt-16 flex items-center gap-4">
          <span className="jp text-[0.65rem] tracking-[0.28em] text-metal-lit">上弦</span>
          <div className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
          <span className="text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">Upper Moons</span>
        </div>

        {/* Upper Moon grid */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {upperMoon.map((c, i) => (
            <CharacterCard key={c.id} character={c} index={i} onHover={setActiveChar} />
          ))}
        </div>
      </div>
    </section>
  );
}
