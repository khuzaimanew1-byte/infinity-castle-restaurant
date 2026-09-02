"use client";
import { useEffect, useRef, useState } from "react";

/* ─── Castle Gate SVG ──────────────────────────────────────────────
   Two large wooden door panels that swing open (3D perspective Y-axis).
   Inspired by the Infinity Castle floor/ceiling doors from the anime.
──────────────────────────────────────────────────────────────────── */

// Door panel SVG details — carved wood look
function DoorPanel({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";

  return (
    <div
      className={`relative flex h-full w-1/2 flex-col overflow-hidden wood-grain
        ${isLeft ? "gate-panel-left border-r border-r-[rgba(0,0,0,0.5)]" : "gate-panel-right border-l border-l-[rgba(0,0,0,0.5)]"}
      `}
      style={{
        background:
          "linear-gradient(180deg, #1c1107 0%, #2a1a0c 18%, #1f1409 40%, #2e1e0e 62%, #1c1107 80%, #130e06 100%)",
      }}
    >
      {/* Vertical planks */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-y-0 border-r"
          style={{
            left: `${28 + i * 22}%`,
            borderColor: "rgba(0,0,0,0.25)",
            background: "rgba(255,255,255,0.012)",
          }}
        />
      ))}

      {/* Horizontal crossbeams */}
      {[18, 38, 55, 74, 88].map((pct) => (
        <div
          key={pct}
          className="absolute inset-x-0 h-px"
          style={{
            top: `${pct}%`,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.4), rgba(255,220,140,0.06), rgba(0,0,0,0.4))",
          }}
        />
      ))}

      {/* Iron bracket ornament — center */}
      <div
        className="absolute inset-x-0 flex items-center justify-center"
        style={{ top: "44%", transform: "translateY(-50%)" }}
      >
        <svg
          viewBox="0 0 60 80"
          className="h-24 w-16 opacity-60"
          fill="none"
          aria-hidden="true"
        >
          {/* Vertical rod */}
          <rect x="28" y="4" width="4" height="72" rx="2"
            fill="rgba(120,90,40,0.8)" />
          {/* Horizontal bars */}
          {[12, 32, 52, 68].map((y) => (
            <rect key={y} x="10" y={y} width="40" height="3" rx="1.5"
              fill="rgba(100,70,30,0.7)" />
          ))}
          {/* Diamond center */}
          <rect x="24" y="36" width="12" height="12" rx="1"
            transform="rotate(45 30 42)"
            fill="rgba(180,130,60,0.5)" />
        </svg>
      </div>

      {/* Door handle / ring (inner edge) */}
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{ [isLeft ? "right" : "left"]: "8%" }}
      >
        <div
          className="h-8 w-8 rounded-full border-2 opacity-70"
          style={{
            borderColor: "rgba(160,110,40,0.9)",
            background: "radial-gradient(circle at 40% 35%, rgba(220,170,70,0.5), rgba(80,50,10,0.8))",
            boxShadow:
              "inset 0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(160,110,40,0.3)",
          }}
        />
      </div>

      {/* Edge shadow — inner seam */}
      <div
        className="absolute inset-y-0 w-8"
        style={{
          [isLeft ? "right" : "left"]: 0,
          background: isLeft
            ? "linear-gradient(90deg, transparent, rgba(0,0,0,0.5))"
            : "linear-gradient(270deg, transparent, rgba(0,0,0,0.5))",
        }}
      />
    </div>
  );
}

/* ─── Kanji ink drip on gate ─── */
function GateKanji() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="relative flex flex-col items-center gap-1">
        {/* 無限城 vertically */}
        {"無限城".split("").map((char, i) => (
          <span
            key={i}
            className="jp block select-none font-display font-bold leading-none"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              color: "rgba(137,97,217,0.18)",
              textShadow: "0 0 40px rgba(137,97,217,0.25)",
              animation: `ink-seep 0.6s ease ${0.5 + i * 0.15}s both`,
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main CastleGate ──────────────────────────────────────────────── */
export default function CastleGate({
  onEntered,
}: {
  onEntered: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "opening" | "done">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload the Biwa audio via a CDN-hosted royalty-free gong/biwa-like sound
  useEffect(() => {
    // We use a short, free ambient gong sound — royalty free
    const audio = new Audio(
      "https://cdn.pixabay.com/audio/2022/06/09/audio_7eedc37de3.mp3"
    );
    audio.preload = "auto";
    audio.volume = 0.65;
    audioRef.current = audio;
    return () => {
      audio.pause();
    };
  }, []);

  const handleEnter = () => {
    if (phase !== "idle") return;

    // Play sound
    try {
      audioRef.current?.play().catch(() => {});
    } catch {}

    setPhase("opening");

    // After doors fully open + brief hold, hide gate
    setTimeout(() => {
      setPhase("done");
      onEntered();
    }, 2600);
  };

  if (phase === "done") return null;

  const isOpening = phase === "opening";

  return (
    <div
      className="fixed inset-0 z-[100] flex select-none flex-col overflow-hidden"
      style={{
        background: "#080604",
        opacity: isOpening ? 1 : 1,
        animation: isOpening
          ? `gate-screen-exit 0.6s ease 2.1s forwards`
          : "none",
      }}
    >
      {/* ── Ambient embers (always present) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className="ember"
            style={{
              left: `${10 + i * 11}%`,
              width: 1.5 + (i % 3),
              height: 1.5 + (i % 3),
              "--duration": `${14 + i * 3}s`,
              "--delay": `${i * 1.8}s`,
              "--drift": `${(i % 2 === 0 ? 1 : -1) * 30}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── The two door panels ── */}
      <div
        className="relative flex h-full w-full"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
      >
        {/* Left panel */}
        <div
          className="h-full w-1/2 overflow-hidden"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            animation: isOpening
              ? "gate-open-left 1.8s cubic-bezier(0.4,0,0.2,1) 0.1s forwards"
              : "none",
          }}
        >
          <DoorPanel side="left" />
        </div>

        {/* Right panel */}
        <div
          className="h-full w-1/2 overflow-hidden"
          style={{
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
            animation: isOpening
              ? "gate-open-right 1.8s cubic-bezier(0.4,0,0.2,1) 0.1s forwards"
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
              ? "linear-gradient(180deg, transparent, rgba(137,97,217,0.9), transparent)"
              : "linear-gradient(180deg, transparent, rgba(137,97,217,0.2), transparent)",
            boxShadow: isOpening
              ? "0 0 24px 8px rgba(137,97,217,0.5)"
              : "none",
          }}
        />

        {/* Blade flash sweep when opening */}
        {isOpening && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.06) 50%, transparent 80%)",
              width: "60%",
              animation: "blade-flash 0.5s ease 0.15s both",
            }}
          />
        )}

        {/* Kanji on gate */}
        {!isOpening && <GateKanji />}

        {/* ── Enter button (idle state) ── */}
        {!isOpening && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-16">
            {/* Logo mark */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <svg
                viewBox="0 0 48 48"
                className="size-12 opacity-80"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="24" cy="24" r="22"
                  stroke="rgba(137,97,217,0.7)"
                  strokeWidth="1.2"
                />
                <circle
                  cx="24" cy="24" r="15"
                  stroke="rgba(160,152,128,0.3)"
                  strokeWidth="0.7"
                />
                <text
                  x="24" y="31"
                  textAnchor="middle"
                  fontSize="20"
                  fontFamily="var(--font-noto-jp)"
                  fill="rgba(237,232,224,0.85)"
                >
                  無
                </text>
              </svg>
              <p className="jp text-[0.65rem] tracking-[0.5em] text-ink-faint">
                無限城 · Infinity Castle Dining
              </p>
            </div>

            <button
              onClick={handleEnter}
              className="group relative overflow-hidden rounded-full px-10 py-4 text-sm uppercase tracking-[0.3em] text-ink transition-all duration-500"
              style={{
                border: "1px solid rgba(137,97,217,0.5)",
                background: "rgba(137,97,217,0.08)",
                animation: "pulse-glow 2.4s ease-in-out infinite",
              }}
            >
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
              <span className="pointer-events-none absolute inset-0 bg-wisteria/0 transition-colors duration-300 group-hover:bg-wisteria/10" />
              <span className="relative z-10 flex items-center gap-3">
                <span className="jp text-[0.7rem] text-wisteria opacity-80">入</span>
                Enter the Castle
                <span className="jp text-[0.7rem] text-wisteria opacity-80">城</span>
              </span>
            </button>

            <p className="mt-5 text-[0.6rem] uppercase tracking-[0.28em] text-ink-faint opacity-50">
              click to enter · tap the gates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
