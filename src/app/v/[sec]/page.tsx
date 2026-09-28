"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VerifyPage() {
  const { sec } = useParams<{ sec: string }>();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");

  useEffect(() => {
    if (!sec) { setStatus("invalid"); return; }
    const ctrl = new AbortController();
    fetch(`/api/verify/${sec}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setStatus(d.valid ? "valid" : "invalid"))
      .catch(e => { if (e.name !== "AbortError") setStatus("invalid"); });
    // Why: AbortController prevents setStatus after unmount (e.g. fast navigation)
    return () => ctrl.abort();
  }, [sec]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-void px-6">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-wisteria/5 blur-[100px]" />
      </div>
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-wisteria/40 bg-wisteria/8">
          <span className="jp text-3xl text-wisteria/70">無</span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-medium text-ink">Infinity Castle Dining</h1>
          <p className="mt-1 text-xs tracking-widest text-ink-faint">Official Dining Pass</p>
        </div>

        {status === "loading" && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-wisteria border-t-transparent" />
        )}

        {status === "valid" && (
          <div className="rounded-xl border border-wisteria/25 bg-wisteria/8 px-6 py-4">
            <p className="text-sm leading-relaxed text-ink">
              Staff will scan this at billing.
            </p>
            <p className="mt-2 text-[0.65rem] text-ink-faint">
              Valid once · Do not share QR screenshot
            </p>
          </div>
        )}

        {status === "invalid" && (
          <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-6 py-4">
            <p className="text-sm text-red-400">Pass not found or already used.</p>
          </div>
        )}

        <p className="text-[0.58rem] text-ink-faint/40">Bahawalpur · Since 2026</p>
      </div>
    </main>
  );
}
