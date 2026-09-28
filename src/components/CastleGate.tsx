"use client";
import { useEffect, useRef, useState } from "react";

/* ─── Door Panel ──────────────────────────────────────────────────── */
function DoorPanel({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      className="relative flex h-full w-full flex-col wood-grain"
      style={{
        background:
          "linear-gradient(180deg,#1c1107 0%,#2a1a0c 18%,#1f1409 40%,#2e1e0e 62%,#1c1107 80%,#130e06 100%)",
      }}
    >
      {/* Plank lines */}
      {[28, 50, 72].map((p) => (
        <div
          key={p}
          className="absolute inset-y-0 w-px"
          style={{ left: `${p}%`, background: "rgba(0,0,0,0.22)" }}
        />
      ))}

      {/* Crossbeams */}
      {[18, 38, 55, 74, 88].map((pct) => (
        <div
          key={pct}
          className="absolute inset-x-0 h-px"
          style={{
            top: `${pct}%`,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.4), rgba(255,220,140,0.05), rgba(0,0,0,0.4))",
          }}
        />
      ))}

      {/* Iron bracket */}
      <div
        className="pointer-events-none absolute inset-x-0 flex items-center justify-center"
        style={{ top: "42%", transform: "translateY(-50%)" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 60 80" className="h-24 w-16 opacity-55" fill="none">
          <rect x="28" y="4" width="4" height="72" rx="2" fill="rgba(120,90,40,0.8)" />
          {[12, 32, 52, 68].map((y) => (
            <rect key={y} x="10" y={y} width="40" height="3" rx="1.5" fill="rgba(100,70,30,0.7)" />
          ))}
          <rect x="24" y="36" width="12" height="12" rx="1" transform="rotate(45 30 42)" fill="rgba(180,130,60,0.5)" />
        </svg>
      </div>

      {/* Door handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{ [isLeft ? "right" : "left"]: "8%" }}
      >
        <div
          className="h-8 w-8 rounded-full border-2 opacity-70"
          style={{
            borderColor: "rgba(160,110,40,0.9)",
            background: "radial-gradient(circle at 40% 35%, rgba(220,170,70,0.5), rgba(80,50,10,0.8))",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(160,110,40,0.3)",
          }}
        />
      </div>

      {/* Inner edge shadow */}
      <div
        className="absolute inset-y-0 w-10"
        style={{
          [isLeft ? "right" : "left"]: 0,
          background: isLeft
            ? "linear-gradient(90deg, transparent, rgba(0,0,0,0.55))"
            : "linear-gradient(270deg, transparent, rgba(0,0,0,0.55))",
        }}
      />
    </div>
  );
}

/* ─── Kanji on gate ───────────────────────────────────────────────── */
function GateKanji() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-0">
        {"無限城".split("").map((char, i) => (
          <span
            key={i}
            className="jp block select-none font-display font-bold leading-none"
            style={{
              fontSize: "clamp(2.6rem,5.5vw,4.2rem)",
              color: "rgba(137,97,217,0.2)",
              textShadow: "0 0 40px rgba(137,97,217,0.3)",
              animation: `ink-seep 0.7s ease ${0.4 + i * 0.18}s both`,
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── CastleGate ──────────────────────────────────────────────────── */
export default function CastleGate({ onEntered }: { onEntered: () => void }) {
  const [phase, setPhase] = useState<"idle" | "opening" | "done">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const audio = new Audio(
      "https://cdn.pixabay.com/audio/2022/06/09/audio_7eedc37de3.mp3"
    );
    audio.preload = "auto";
    audio.volume = 0.65;
    audioRef.current = audio;
    return () => {
      // Why: audio.pause() alone keeps the network connection + decoded buffer alive.
      // Setting src="" releases both the network resource and the decoded audio data.
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      // Cancel any pending gate-close timer to prevent setState on unmounted component
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleEnter = () => {
    if (phase !== "idle") return;
    try { audioRef.current?.play().catch(() => {}); } catch {}
    setPhase("opening");
    // Why: store timeout ID so it can be cancelled if component unmounts within 2600ms
    timerRef.current = setTimeout(() => { setPhase("done"); onEntered(); }, 2600);
  };

  if (phase === "done") return null;

  const isOpening = phase === "opening";

  return (
    <div
      className="fixed inset-0 z-[100] select-none overflow-hidden"
      style={{
        background: "#080604",
        animation: isOpening ? "gate-screen-exit 0.55s ease 2.1s forwards" : "none",
      }}
    >
      {/* Ambient embers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className="ember"
            style={{
              left: `${8 + i * 9}%`,
              width: 1.5 + (i % 3),
              height: 1.5 + (i % 3),
              "--duration": `${13 + i * 2.5}s`,
              "--delay": `${i * 1.6}s`,
              "--drift": `${(i % 2 === 0 ? 1 : -1) * 28}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Door panels — perspective set on PARENT, only rotateY on children ── */}
      <div
        className="relative flex h-full w-full"
        style={{ perspective: "1400px", perspectiveOrigin: "50% 50%" }}
      >
        {/* Left panel wrapper */}
        <div
          className="h-full w-1/2"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            animation: isOpening
              ? "gate-open-left 1.9s cubic-bezier(0.42,0,0.18,1) 0.08s forwards"
              : "none",
          }}
        >
          <DoorPanel side="left" />
        </div>

        {/* Right panel wrapper */}
        <div
          className="h-full w-1/2"
          style={{
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
            animation: isOpening
              ? "gate-open-right 1.9s cubic-bezier(0.42,0,0.18,1) 0.08s forwards"
              : "none",
          }}
        >
          <DoorPanel side="right" />
        </div>

        {/* Center seam glow */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-all duration-700"
          style={{
            background: isOpening
              ? "linear-gradient(180deg, transparent 5%, rgba(137,97,217,0.95) 50%, transparent 95%)"
              : "linear-gradient(180deg, transparent 5%, rgba(137,97,217,0.18) 50%, transparent 95%)",
            boxShadow: isOpening ? "0 0 32px 10px rgba(137,97,217,0.55)" : "none",
          }}
        />

        {/* Blade flash on open */}
        {isOpening && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-[55%]"
            style={{
              left: "22%",
              background:
                "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.05) 50%, transparent 80%)",
              animation: "blade-flash 0.5s ease 0.12s both",
            }}
          />
        )}

        {/* Kanji — only in idle */}
        {!isOpening && <GateKanji />}

        {/* ── Enter button ── */}
        {!isOpening && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none">
            <div className="mb-6 flex flex-col items-center gap-3 pointer-events-none">
              <svg viewBox="0 0 48 48" className="size-11 opacity-75" fill="none" aria-hidden="true">
                <circle cx="24" cy="24" r="22" stroke="rgba(137,97,217,0.7)" strokeWidth="1.2" />
                <circle cx="24" cy="24" r="15" stroke="rgba(160,152,128,0.3)" strokeWidth="0.7" />
                <text x="24" y="31" textAnchor="middle" fontSize="20"
                  fontFamily="var(--font-noto-jp)" fill="rgba(237,232,224,0.85)">無</text>
              </svg>
              <p className="jp text-[0.62rem] tracking-[0.5em] text-ink-faint">
                無限城 · Infinity Castle Dining
              </p>
            </div>

            <button
              onClick={handleEnter}
              className="pointer-events-auto group relative overflow-hidden rounded-full px-10 py-4 text-sm uppercase tracking-[0.3em] text-ink transition-all duration-500 hover:scale-105"
              style={{
                border: "1px solid rgba(137,97,217,0.5)",
                background: "rgba(137,97,217,0.08)",
                animation: "pulse-glow 2.4s ease-in-out infinite",
              }}
            >
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
              <span className="pointer-events-none absolute inset-0 bg-wisteria/0 transition-colors duration-300 group-hover:bg-wisteria/12" />
              <span className="relative z-10 flex items-center gap-3">
                <span className="jp text-[0.7rem] text-wisteria opacity-80">入</span>
                Enter the Castle
                <span className="jp text-[0.7rem] text-wisteria opacity-80">城</span>
              </span>
            </button>

            <p className="mt-5 text-[0.58rem] uppercase tracking-[0.28em] text-ink-faint opacity-40">
              tap to enter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
