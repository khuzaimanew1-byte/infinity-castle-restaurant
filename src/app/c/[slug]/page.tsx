"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { fmtDsc, STS_COLOR } from "@/lib/constants";
import type { DscType, CpnStatus } from "@/lib/constants";

// ── Types ────────────────────────────────────────────────────────
interface CouponData {
  cpnId: string;
  sec:   string;
  dsc:   number;
  typ:   DscType;
  sts:   CpnStatus;
}
interface LinkInfo {
  lid:     string;
  nam:     string;
  claimed?: boolean;
  sameLid?: boolean;
}

// ── Coupon Ticket Canvas download ────────────────────────────────
async function downloadCoupon(opts: {
  qrDataUrl: string;
  dsc: number;
  typ: DscType;
  sec: string;
  cpnId: string;
}) {
  const W = 900, H = 420;
  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0B0906");
  grad.addColorStop(1, "#1A1208");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Wisteria border
  ctx.strokeStyle = "#8961D9";
  ctx.lineWidth   = 3;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  ctx.strokeStyle = "rgba(137,97,217,0.2)";
  ctx.lineWidth   = 1;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  // Perforated divider (right side for QR zone)
  const QZ = 250;
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = "rgba(137,97,217,0.35)";
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(W - QZ, 30);
  ctx.lineTo(W - QZ, H - 30);
  ctx.stroke();
  ctx.setLineDash([]);

  // Kanji watermark
  ctx.font      = "bold 160px serif";
  ctx.fillStyle = "rgba(137,97,217,0.05)";
  ctx.textAlign = "center";
  ctx.fillText("無限城", W / 2 - QZ / 2, H / 2 + 60);

  // Brand name
  ctx.font      = "24px 'Playfair Display', serif";
  ctx.fillStyle = "rgba(237,232,224,0.9)";
  ctx.textAlign = "left";
  ctx.fillText("INFINITY CASTLE DINING", 40, 72);

  // Tagline
  ctx.font      = "13px sans-serif";
  ctx.fillStyle = "rgba(160,140,100,0.8)";
  ctx.fillText("Exclusive Dining Pass • Bahawalpur", 40, 100);

  // Divider
  ctx.strokeStyle = "rgba(137,97,217,0.4)";
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(40, 115);
  ctx.lineTo(W - QZ - 30, 115);
  ctx.stroke();

  // Discount label
  ctx.font      = "bold 52px 'Playfair Display', serif";
  ctx.fillStyle = "#D4935A";
  ctx.fillText(fmtDsc(opts.dsc, opts.typ), 40, 195);

  // Sub-label
  ctx.font      = "14px sans-serif";
  ctx.fillStyle = "rgba(160,140,100,0.7)";
  ctx.fillText("Present at cash counter upon dining", 40, 225);

  // Code section
  ctx.font      = "12px monospace";
  ctx.fillStyle = "rgba(137,97,217,0.7)";
  ctx.fillText("PASS CODE", 40, 295);
  ctx.font      = "bold 26px monospace";
  ctx.fillStyle = "#EDe8e0";
  ctx.fillText(opts.sec, 40, 328);

  // ID
  ctx.font      = "10px monospace";
  ctx.fillStyle = "rgba(160,140,100,0.5)";
  ctx.fillText(`ID: ${opts.cpnId.slice(0, 8).toUpperCase()}`, 40, 380);

  // Footer
  ctx.font      = "11px sans-serif";
  ctx.fillStyle = "rgba(137,97,217,0.5)";
  ctx.fillText("Valid once • Infinity Castle Dining, Bahawalpur", 40, H - 24);

  // QR image
  const qrImg = new Image();
  await new Promise<void>((res, rej) => {
    qrImg.onload  = () => res();
    qrImg.onerror = rej;
    qrImg.src     = opts.qrDataUrl;
  });
  const qrSize = 180;
  const qrX    = W - QZ + (QZ - qrSize) / 2;
  const qrY    = (H - qrSize) / 2 - 20;
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Code under QR
  ctx.font      = "bold 18px monospace";
  ctx.fillStyle = "rgba(237,232,224,0.85)";
  ctx.textAlign = "center";
  ctx.fillText(opts.sec, W - QZ + QZ / 2, qrY + qrSize + 28);
  ctx.font      = "11px sans-serif";
  ctx.fillStyle = "rgba(137,97,217,0.6)";
  ctx.fillText("Scan at counter", W - QZ + QZ / 2, qrY + qrSize + 48);

  // Download as PNG
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href    = url;
    a.download = `infinity-castle-pass-${opts.sec}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

// ── Sealed talisman visual (unauthenticated state) ────────────────
function SealedPass() {
  return (
    <div className="relative flex h-72 w-full max-w-sm items-center justify-center rounded-2xl border border-wisteria/25 bg-gradient-to-b from-timber to-void">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ boxShadow: "inset 0 0 60px rgba(137,97,217,0.12)" }} />
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-wisteria/40"
          style={{ background: "radial-gradient(circle, rgba(137,97,217,0.15), rgba(11,9,6,0.8))", animation: "pulse-glow 2.8s ease-in-out infinite" }}
        >
          <span className="jp select-none text-4xl text-wisteria/70">封</span>
        </div>
        <p className="jp text-xs tracking-[0.3em] text-ink-faint">封印 · Sealed</p>
        <p className="max-w-[200px] text-center text-[0.7rem] leading-relaxed text-ink-faint/60">
          Login to reveal your exclusive dining pass & discount
        </p>
      </div>
    </div>
  );
}

// ── QR + Download ticket ──────────────────────────────────────────
function UnlockedPass({ data }: { data: CouponData }) {
  const [qrUrl, setQrUrl] = useState("");

  const verifyUrl = `${window.location.origin}/v/${data.sec}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width:            220,
      margin:           1,
      color: { dark: "#EDe8e0", light: "#0B0906" },
      errorCorrectionLevel: "H",
    }).then(setQrUrl);
  }, [verifyUrl]);

  const handleDownload = useCallback(async () => {
    if (!qrUrl) return;
    await downloadCoupon({ qrDataUrl: qrUrl, dsc: data.dsc, typ: data.typ, sec: data.sec, cpnId: data.cpnId });
  }, [qrUrl, data]);

  const color = STS_COLOR[data.sts];

  return (
    <div
      className="relative flex w-full max-w-xl overflow-hidden rounded-2xl border"
      style={{ borderColor: `${color}35`, background: "linear-gradient(135deg, #0F0C08, #1A1208)" }}
    >
      {/* Wisteria border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ boxShadow: `inset 0 0 80px ${color}12` }} />
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />

      {/* LEFT: Ticket info */}
      <div className="flex flex-1 flex-col justify-between p-7">
        <div>
          <p className="jp text-[0.6rem] tracking-[0.4em] text-ink-faint">無限城 · INFINITY CASTLE DINING</p>
          <h2 className="mt-3 font-display text-3xl font-bold" style={{ color: "#D4935A" }}>
            {fmtDsc(data.dsc, data.typ)}
          </h2>
          <p className="mt-1 text-xs text-ink-soft">Present at cash counter upon dining</p>
        </div>
        <div className="mt-6">
          <p className="text-[0.6rem] uppercase tracking-[0.25em] text-ink-faint">Pass Code</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-[0.3em] text-ink">{data.sec}</p>
          <p className="mt-4 text-[0.6rem] text-ink-faint/50">ID · {data.cpnId.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Perforation */}
      <div className="flex flex-col items-center justify-between py-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-2 w-2 rounded-full bg-void" />
        ))}
      </div>

      {/* RIGHT: QR zone */}
      <div className="flex w-52 flex-col items-center justify-center gap-4 p-6">
        {qrUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrUrl} alt="Coupon QR" className="h-36 w-36 rounded-lg" />
        ) : (
          <div className="h-36 w-36 animate-pulse rounded-lg bg-wisteria/10" />
        )}
        <p className="font-mono text-sm font-bold tracking-[0.2em] text-ink/80">{data.sec}</p>
        <p className="text-[0.58rem] text-ink-faint/50">Scan at counter</p>
      </div>

      {/* Download btn */}
      <button
        onClick={handleDownload}
        className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-wisteria/30 bg-wisteria/10 px-4 py-2 text-[0.65rem] uppercase tracking-widest text-wisteria transition-all hover:bg-wisteria/20"
      >
        ↓ Download Pass
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ClaimPage() {
  const { slug } = useParams<{ slug: string }>();
  const [link,    setLink]    = useState<LinkInfo | null>(null);
  const [coupon,  setCoupon]  = useState<CouponData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [session, setSession] = useState<{ id?: string; name?: string } | null>(null);

  // Check session
  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(s => {
      setSession(s?.user ?? null);
    });
  }, []);

  // Resolve link + existing coupon
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/claim/${slug}`)
      .then(r => r.json())
      .then((data) => {
        setLink({ lid: data.lid, nam: data.nam, claimed: data.claimed, sameLid: data.sameLid });
        if (data.claimed) {
          setCoupon({ cpnId: data.cpnId, sec: data.sec, dsc: data.dsc, typ: data.typ, sts: data.sts });
          if (!data.sameLid) {
            setMsg("Special reward already claimed! Your pass is active below.");
          }
        }
      })
      .finally(() => setLoading(false));
  }, [slug, session]);

  const handleLogin = () => {
    // Redirect to Google sign-in, return to same page
    window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(window.location.href)}`;
  };

  const handleClaim = async () => {
    if (!session?.id || claiming) return;
    setClaiming(true);
    const res = await fetch(`/api/claim/${slug}`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setCoupon({ cpnId: data.cpnId, sec: data.sec, dsc: data.dsc, typ: data.typ, sts: "A" });
    } else if (data.error === "already_claimed") {
      setMsg("Special reward already claimed! Your pass is active below.");
      // Reload to fetch existing coupon
      window.location.reload();
    }
    setClaiming(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-wisteria border-t-transparent" />
      </div>
    );
  }

  if (!link) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <p className="text-ink-faint">Invalid or expired link.</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-void px-6 py-16">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-wisteria/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center">
          <p className="jp text-[0.6rem] tracking-[0.5em] text-wisteria/60">無限城</p>
          <h1 className="mt-2 font-display text-3xl font-medium text-ink">Infinity Castle Dining</h1>
          {link.nam && (
            <p className="mt-1 text-sm text-ink-soft">
              Exclusive pass via <span className="text-ink">{link.nam}</span>
            </p>
          )}
        </div>

        {/* Psychological message for cross-promoter duplicate */}
        {msg && (
          <div className="w-full rounded-xl border border-wisteria/25 bg-wisteria/8 px-5 py-3 text-center">
            <p className="text-sm text-ink">{msg}</p>
          </div>
        )}

        {/* Main coupon area */}
        {coupon ? (
          <UnlockedPass data={coupon} />
        ) : !session ? (
          <div className="flex flex-col items-center gap-6">
            <SealedPass />
            <button
              onClick={handleLogin}
              className="flex items-center gap-3 rounded-full border border-wisteria/40 bg-wisteria/10 px-8 py-3.5 text-sm text-ink transition-all hover:bg-wisteria/20"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <SealedPass />
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="rounded-full border border-wisteria/40 bg-wisteria/10 px-8 py-3.5 text-sm text-ink transition-all hover:bg-wisteria/20 disabled:opacity-50"
            >
              {claiming ? "Claiming…" : "Claim Your Pass"}
            </button>
          </div>
        )}

        <p className="text-[0.6rem] text-ink-faint/40">
          Valid once · Infinity Castle Dining, Bahawalpur
        </p>
      </div>
    </main>
  );
}
