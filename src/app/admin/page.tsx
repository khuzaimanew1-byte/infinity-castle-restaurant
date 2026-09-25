"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import QrScanner from "qr-scanner";
import { fmtDsc, calcNet } from "@/lib/constants";
import type { DscType } from "@/lib/constants";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "";

// ── Types ─────────────────────────────────────────────────────────
interface CpnResult {
  sec:  string;
  dsc:  number;
  typ:  DscType;
  sts:  string;
  cid?: string;
}
interface LinkStat {
  lid: string; nam: string; ref: string;
  cnt: number; clm: number; com: number; crt: string;
}

async function apiRedeem(sec: string, bil: number, com: number) {
  const res = await fetch("/api/admin/redeem", {
    method:  "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
    body:    JSON.stringify({ sec, bil, com }),
  });
  return res.json();
}

// ── Scanner view ──────────────────────────────────────────────────
function ScanView() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [mode,   setMode]   = useState<"camera" | "manual">("camera");
  const [code,   setCode]   = useState("");         // scanned / typed sec
  const [cpn,    setCpn]    = useState<CpnResult | null>(null);
  const [bill,   setBill]   = useState("");
  const [comm,   setComm]   = useState("");
  const [status, setStatus] = useState<"idle" | "found" | "done" | "err">("idle");
  const [msg,    setMsg]    = useState("");
  const [net,    setNet]    = useState<number | null>(null);

  const lookupCode = useCallback(async (sec: string) => {
    setStatus("idle");
    const res = await fetch(`/api/verify/${sec}`);
    const data = await res.json();
    if (!data.valid) { setMsg("Pass not found."); setStatus("err"); return; }
    if (data.sts !== "A") { setMsg(`Pass is ${data.sts === "R" ? "already redeemed" : "expired"}.`); setStatus("err"); return; }
    setCpn({ sec, dsc: data.dsc, typ: data.typ, sts: data.sts });
    setStatus("found");
    setMsg("");
  }, []);

  // Camera scanner init
  useEffect(() => {
    if (mode !== "camera" || !videoRef.current) return;
    const scanner = new QrScanner(
      videoRef.current,
      (result) => { lookupCode(result.data); scanner.stop(); },
      { highlightScanRegion: true, highlightCodeOutline: true }
    );
    scanner.start().catch(() => setMode("manual"));
    scannerRef.current = scanner;
    return () => { scanner.destroy(); };
  }, [mode, lookupCode]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length >= 4) lookupCode(code.trim());
  };

  const handleRedeem = async () => {
    if (!cpn || !bill || !comm) return;
    const bilN = parseFloat(bill);
    const comN = parseFloat(comm);
    const result = await apiRedeem(cpn.sec, bilN, comN);
    if (result.ok) {
      setNet(result.net);
      setStatus("done");
      setMsg("");
    } else {
      setMsg(result.error ?? "Error");
      setStatus("err");
    }
  };

  const reset = () => { setCpn(null); setCode(""); setBill(""); setComm(""); setStatus("idle"); setMsg(""); setNet(null); };

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {["camera", "manual"].map((m) => (
          <button key={m} onClick={() => { reset(); setMode(m as "camera" | "manual"); }}
            className={`rounded-full px-5 py-2 text-xs uppercase tracking-widest transition-all ${mode === m ? "bg-wisteria/20 text-wisteria border border-wisteria/40" : "border border-line text-ink-faint hover:border-wisteria/30"}`}
          >{m === "camera" ? "📷 Camera" : "⌨️ Enter Code"}</button>
        ))}
      </div>

      {/* Camera */}
      {mode === "camera" && status === "idle" && (
        <div className="overflow-hidden rounded-xl border border-line">
          <video ref={videoRef} className="w-full" />
        </div>
      )}

      {/* Manual input */}
      {mode === "manual" && status === "idle" && (
        <form onSubmit={handleManualSubmit} className="flex gap-3">
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="XXXX"
            maxLength={4}
            className="res-input w-28 rounded-xl border border-line bg-void px-4 py-3 text-center font-mono text-xl tracking-[0.4em] text-ink"
          />
          <button type="submit"
            className="rounded-xl border border-wisteria/40 bg-wisteria/10 px-6 py-3 text-sm text-wisteria hover:bg-wisteria/20">
            Lookup
          </button>
        </form>
      )}

      {/* Error */}
      {status === "err" && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-5 py-3">
          <p className="text-sm text-red-400">{msg}</p>
          <button onClick={reset} className="mt-2 text-xs text-ink-faint underline">Try again</button>
        </div>
      )}

      {/* Found — settlement form */}
      {status === "found" && cpn && (
        <div className="rounded-xl border border-wisteria/25 bg-wisteria/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-faint">Pass Code</p>
              <p className="font-mono text-xl font-bold text-ink">{cpn.sec}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-ink-faint">Discount</p>
              <p className="font-display text-xl text-lantern">{fmtDsc(cpn.dsc, cpn.typ)}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">Total Bill (Rs)</label>
              <input type="number" value={bill} onChange={e => setBill(e.target.value)} min={0}
                className="res-input w-full rounded-xl border border-line bg-void px-4 py-2.5 text-sm text-ink"
                placeholder="e.g. 2500" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">Commission (Rs)</label>
              <input type="number" value={comm} onChange={e => setComm(e.target.value)} min={0}
                className="res-input w-full rounded-xl border border-line bg-void px-4 py-2.5 text-sm text-ink"
                placeholder="e.g. 100" />
            </div>
          </div>

          {bill && cpn && (
            <p className="mt-3 text-sm text-ink-soft">
              Net payable: <span className="font-bold text-ink">Rs {calcNet(parseFloat(bill), cpn.dsc, cpn.typ).toLocaleString()}</span>
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <button onClick={handleRedeem} disabled={!bill || !comm}
              className="flex-1 rounded-xl bg-wisteria/20 border border-wisteria/40 py-3 text-sm text-wisteria hover:bg-wisteria/30 disabled:opacity-40">
              ✓ Confirm Redemption
            </button>
            <button onClick={reset} className="rounded-xl border border-line px-4 py-3 text-xs text-ink-faint hover:border-wisteria/30">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Done */}
      {status === "done" && net !== null && (
        <div className="rounded-xl border border-green-900/40 bg-green-950/15 p-5 text-center">
          <p className="text-lg font-bold text-green-400">✓ Redeemed</p>
          <p className="mt-1 text-sm text-ink-soft">Customer pays: <span className="font-bold text-ink">Rs {net.toLocaleString()}</span></p>
          <button onClick={reset} className="mt-4 rounded-full border border-line px-6 py-2 text-xs text-ink-faint hover:border-wisteria/30">Scan Next</button>
        </div>
      )}
    </div>
  );
}

// ── Promoter dashboard ─────────────────────────────────────────────
function PromoterDashboard() {
  const [links, setLinks] = useState<LinkStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNam, setNewNam] = useState("");
  const [newDsc, setNewDsc] = useState("");
  const [newTyp, setNewTyp] = useState<"F" | "P">("F");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/links", { headers: { "x-admin-key": ADMIN_KEY } });
    setLinks(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNam || !newDsc) return;
    setCreating(true);
    await fetch("/api/admin/links", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body:    JSON.stringify({ nam: newNam, dsc: parseFloat(newDsc), typ: newTyp }),
    });
    setNewNam(""); setNewDsc("");
    await load();
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create new link */}
      <form onSubmit={handleCreate} className="rounded-xl border border-line p-5">
        <h3 className="mb-4 text-sm font-medium text-ink">New Promoter Link</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <input value={newNam} onChange={e => setNewNam(e.target.value)} placeholder="Promoter name"
            className="res-input col-span-2 sm:col-span-1 rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink" />
          <input value={newDsc} onChange={e => setNewDsc(e.target.value)} type="number" placeholder="Discount value"
            className="res-input rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink" />
          <select value={newTyp} onChange={e => setNewTyp(e.target.value as "F" | "P")}
            className="res-input rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink">
            <option value="F">Fixed (Rs)</option>
            <option value="P">Percentage (%)</option>
          </select>
        </div>
        <button type="submit" disabled={creating || !newNam || !newDsc}
          className="mt-4 rounded-lg border border-wisteria/40 bg-wisteria/10 px-5 py-2 text-sm text-wisteria hover:bg-wisteria/20 disabled:opacity-40">
          {creating ? "Creating…" : "+ Create Link"}
        </button>
      </form>

      {/* Link stats */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />)}
        </div>
      ) : links.length === 0 ? (
        <p className="text-sm text-ink-faint">No links created yet.</p>
      ) : (
        <div className="space-y-3">
          {links.map(l => (
            <div key={l.lid} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">{l.nam}</p>
                  <p className="mt-0.5 font-mono text-xs text-ink-faint">
                    /c/{l.ref}
                  </p>
                </div>
                <div className="flex shrink-0 gap-5 text-right">
                  <div><p className="text-[0.65rem] text-ink-faint">Visits</p><p className="font-bold text-ink">{l.cnt}</p></div>
                  <div><p className="text-[0.65rem] text-ink-faint">Claims</p><p className="font-bold text-ink">{l.clm}</p></div>
                  <div><p className="text-[0.65rem] text-ink-faint">Commission</p><p className="font-bold text-lantern">Rs {Number(l.com).toLocaleString()}</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin Root ────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<"scan" | "promoters">("scan");
  const [auth, setAuth] = useState(false);
  const [key,  setKey]  = useState("");

  if (!auth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-void px-6">
        <form onSubmit={(e) => { e.preventDefault(); if (key === ADMIN_KEY) setAuth(true); }}
          className="flex flex-col gap-4 w-full max-w-xs">
          <h1 className="font-display text-2xl text-ink text-center">Admin Access</h1>
          <input type="password" value={key} onChange={e => setKey(e.target.value)}
            placeholder="Enter admin key"
            className="res-input rounded-xl border border-line bg-void px-4 py-3 text-sm text-ink" />
          <button type="submit" className="rounded-xl bg-wisteria/15 border border-wisteria/40 py-3 text-sm text-wisteria hover:bg-wisteria/25">
            Enter
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-void px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-2xl font-medium text-ink">Admin Panel</h1>
          <p className="jp text-xs text-ink-faint">無限城管理</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {(["scan", "promoters"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-xs uppercase tracking-widest transition-all
                ${tab === t ? "bg-wisteria/20 border border-wisteria/40 text-wisteria" : "border border-line text-ink-faint hover:border-wisteria/30"}`}>
              {t === "scan" ? "QR Scanner" : "Promoters"}
            </button>
          ))}
        </div>

        {tab === "scan"      && <ScanView />}
        {tab === "promoters" && <PromoterDashboard />}
      </div>
    </main>
  );
}
