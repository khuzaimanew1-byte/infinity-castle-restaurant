"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import QrScanner from "qr-scanner";
import { fmtDsc, calcNet } from "@/lib/constants";
import type { DscType } from "@/lib/constants";

/**
 * Admin Panel — /admin
 * Tabs: QR Scanner | Promoters | Reservations | Menu
 *
 * Security: Admin key entered at runtime, verified server-side via probe.
 * Never stored in env vars or source code with NEXT_PUBLIC_ prefix.
 */

// ── Types ─────────────────────────────────────────────────────────
interface CpnResult { sec: string; dsc: number; typ: DscType; sts: string; }
interface LinkStat  { lid: string; nam: string; ref: string; dsc: number; typ: string; cnt: number; clm: number; com: number; crt: string; }
interface Rsv       { rid: string; nam: string; pax: number; dat: string; tim: string; evt: string; msg: string | null; sts: string; crt: string; }
interface MenuItem  { id: string; name: string; category: string; price: number; isSignature: boolean; }
interface Category  { id: string; label: string; }

const STS_RSV: Record<string, string> = { P: "Pending", C: "Confirmed", X: "Cancelled" };
const STS_RSV_COLOR: Record<string, string> = { P: "#8961D9", C: "#5aad5a", X: "#888" };

// ── Scanner View ──────────────────────────────────────────────────
function ScanView({ adminKey }: { adminKey: string }) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [mode,   setMode]   = useState<"camera" | "manual">("camera");
  const [code,   setCode]   = useState("");
  const [cpn,    setCpn]    = useState<CpnResult | null>(null);
  const [bill,   setBill]   = useState("");
  const [comm,   setComm]   = useState("");
  const [status, setStatus] = useState<"idle" | "found" | "done" | "err">("idle");
  const [msg,    setMsg]    = useState("");
  const [net,    setNet]    = useState<number | null>(null);

  const lookupCode = useCallback(async (sec: string) => {
    const trimmed = sec.trim().toUpperCase();
    if (trimmed.length !== 4) { setMsg("Code must be exactly 4 characters."); setStatus("err"); return; }
    setStatus("idle"); setMsg("");
    try {
      const res  = await fetch(`/api/verify/${trimmed}`);
      const data = await res.json();
      if (!data.valid) { setMsg(res.status === 404 ? "Pass not found." : "Invalid code."); setStatus("err"); return; }
      if (data.sts !== "A") { setMsg(data.sts === "R" ? "Pass already redeemed." : "Pass has expired."); setStatus("err"); return; }
      setCpn({ sec: trimmed, dsc: Number(data.dsc), typ: data.typ as DscType, sts: data.sts });
      setStatus("found");
    } catch { setMsg("Network error. Try again."); setStatus("err"); }
  }, []);

  useEffect(() => {
    if (mode !== "camera" || !videoRef.current || status !== "idle") return;
    const scanner = new QrScanner(
      videoRef.current,
      (result) => { scanner.stop(); lookupCode(result.data); },
      { highlightScanRegion: true, highlightCodeOutline: true }
    );
    scanner.start().catch(() => setMode("manual"));
    scannerRef.current = scanner;
    return () => { scanner.destroy(); scannerRef.current = null; };
  }, [mode, status, lookupCode]);

  const handleManualSubmit = (e: React.FormEvent) => { e.preventDefault(); lookupCode(code); };

  const handleRedeem = async () => {
    if (!cpn || !bill || !comm) return;
    const bilN = parseFloat(bill);
    const comN = parseFloat(comm);
    if (isNaN(bilN) || bilN <= 0) { setMsg("Enter a valid bill amount."); setStatus("err"); return; }
    if (isNaN(comN) || comN < 0)  { setMsg("Commission must be 0 or more."); setStatus("err"); return; }
    try {
      const res    = await fetch("/api/admin/redeem", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ sec: cpn.sec, bil: bilN, com: comN }),
      });
      const result = await res.json();
      if (result.ok) { setNet(result.net); setStatus("done"); setMsg(""); }
      else           { setMsg(result.error ?? "Redemption failed."); setStatus("err"); }
    } catch { setMsg("Network error. Try again."); setStatus("err"); }
  };

  const reset = useCallback(() => {
    setCpn(null); setCode(""); setBill(""); setComm("");
    setStatus("idle"); setMsg(""); setNet(null);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {(["camera", "manual"] as const).map((m) => (
          <button key={m} onClick={() => { reset(); setMode(m); }}
            className={`rounded-full px-5 py-2 text-xs uppercase tracking-widest transition-all
              ${mode === m ? "border border-wisteria/40 bg-wisteria/20 text-wisteria" : "border border-line text-ink-faint hover:border-wisteria/30"}`}>
            {m === "camera" ? "📷 Camera" : "⌨️ Enter Code"}
          </button>
        ))}
      </div>

      {mode === "camera" && status === "idle" && (
        <div className="overflow-hidden rounded-xl border border-line"><video ref={videoRef} className="w-full" /></div>
      )}

      {mode === "manual" && status === "idle" && (
        <form onSubmit={handleManualSubmit} className="flex gap-3">
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="XXXX" maxLength={4} autoFocus
            className="res-input w-28 rounded-xl border border-line bg-void px-4 py-3 text-center font-mono text-xl tracking-[0.4em] text-ink" />
          <button type="submit" disabled={code.length < 4}
            className="rounded-xl border border-wisteria/40 bg-wisteria/10 px-6 py-3 text-sm text-wisteria hover:bg-wisteria/20 disabled:opacity-40">
            Lookup
          </button>
        </form>
      )}

      {status === "err" && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-5 py-3">
          <p className="text-sm text-red-400">{msg}</p>
          <button onClick={reset} className="mt-2 text-xs text-ink-faint underline">Try again</button>
        </div>
      )}

      {status === "found" && cpn && (
        <div className="rounded-xl border border-wisteria/25 bg-wisteria/5 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-xs uppercase tracking-widest text-ink-faint">Pass Code</p><p className="font-mono text-xl font-bold text-ink">{cpn.sec}</p></div>
            <div className="text-right"><p className="text-xs uppercase tracking-widest text-ink-faint">Discount</p><p className="font-display text-xl text-lantern">{fmtDsc(cpn.dsc, cpn.typ)}</p></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">Total Bill (Rs)</label>
              <input type="number" min="1" step="1" value={bill} onChange={e => setBill(e.target.value)}
                className="res-input w-full rounded-xl border border-line bg-void px-4 py-2.5 text-sm text-ink" placeholder="e.g. 2500" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">Commission (Rs)</label>
              <input type="number" min="0" step="1" value={comm} onChange={e => setComm(e.target.value)}
                className="res-input w-full rounded-xl border border-line bg-void px-4 py-2.5 text-sm text-ink" placeholder="e.g. 100" />
            </div>
          </div>
          {bill && !isNaN(parseFloat(bill)) && (
            <p className="mt-3 text-sm text-ink-soft">Net payable: <span className="font-bold text-ink">Rs {calcNet(parseFloat(bill), cpn.dsc, cpn.typ).toLocaleString()}</span></p>
          )}
          <div className="mt-5 flex gap-3">
            <button onClick={handleRedeem} disabled={!bill || !comm}
              className="flex-1 rounded-xl border border-wisteria/40 bg-wisteria/20 py-3 text-sm text-wisteria hover:bg-wisteria/30 disabled:opacity-40">
              ✓ Confirm Redemption
            </button>
            <button onClick={reset} className="rounded-xl border border-line px-4 py-3 text-xs text-ink-faint hover:border-wisteria/30">Cancel</button>
          </div>
        </div>
      )}

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

// ── Promoter Dashboard ────────────────────────────────────────────
function PromoterDashboard({ adminKey }: { adminKey: string }) {
  const [links, setLinks]   = useState<LinkStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [newNam, setNewNam] = useState("");
  const [newDsc, setNewDsc] = useState("");
  const [newTyp, setNewTyp] = useState<"F" | "P">("F");
  const [creating, setCreating] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // Why: abort any previous in-flight request before starting a new one
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/links", {
        headers: { "x-admin-key": adminKey },
        signal: ctrl.signal,
      });
      if (!res.ok) { setError("Failed to load links."); return; }
      setLinks(await res.json());
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Network error.");
    } finally { setLoading(false); }
  }, [adminKey]);

  useEffect(() => {
    load();
    // Why: abort in-flight request if tab switches away (component unmounts)
    return () => { abortRef.current?.abort(); };
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const dscNum = parseFloat(newDsc);
    if (!newNam.trim() || isNaN(dscNum) || dscNum <= 0) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ nam: newNam.trim(), dsc: dscNum, typ: newTyp }),
      });
      if (res.ok) { setNewNam(""); setNewDsc(""); await load(); }
    } catch { /* silent */ }
    finally { setCreating(false); }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCreate} className="rounded-xl border border-line p-5">
        <h3 className="mb-4 text-sm font-medium text-ink">New Promoter Link</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <input value={newNam} onChange={e => setNewNam(e.target.value)} placeholder="Promoter name"
            className="res-input col-span-2 sm:col-span-1 rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink" />
          <input value={newDsc} onChange={e => setNewDsc(e.target.value)} type="number" min="1" step="any" placeholder="Discount value"
            className="res-input rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink" />
          <select value={newTyp} onChange={e => setNewTyp(e.target.value as "F" | "P")}
            className="res-input rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink">
            <option value="F">Fixed (Rs)</option>
            <option value="P">Percentage (%)</option>
          </select>
        </div>
        <button type="submit" disabled={creating || !newNam.trim() || !newDsc}
          className="mt-4 rounded-lg border border-wisteria/40 bg-wisteria/10 px-5 py-2 text-sm text-wisteria hover:bg-wisteria/20 disabled:opacity-40">
          {creating ? "Creating…" : "+ Create Link"}
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-wisteria/5" />)}</div>
      ) : links.length === 0 ? (
        <p className="text-sm text-ink-faint">No links yet.</p>
      ) : (
        <div className="space-y-3">
          {links.map(l => (
            <div key={l.lid} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{l.nam}</p>
                  <p className="mt-0.5 font-mono text-xs text-ink-faint">/c/{l.ref}</p>
                  <p className="mt-0.5 text-xs text-ink-faint/60">{l.typ === "F" ? `Rs ${Number(l.dsc).toLocaleString()} OFF` : `${l.dsc}% OFF`}</p>
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

// ── Reservations Inbox ────────────────────────────────────────────
function ReservationsInbox({ adminKey }: { adminKey: string }) {
  const [reservations, setReservations] = useState<Rsv[]>([]);
  const [loading, setLoading]  = useState(true);
  const [filter, setFilter]    = useState<"" | "P" | "C" | "X">("");
  const [error, setError]      = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setError("");
    try {
      const qs  = filter ? `?sts=${filter}` : "";
      const res = await fetch(`/api/admin/reservations${qs}`, {
        headers: { "x-admin-key": adminKey },
        signal: ctrl.signal,
      });
      if (!res.ok) { setError("Failed to load."); return; }
      setReservations(await res.json());
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Network error.");
    } finally { setLoading(false); }
  }, [adminKey, filter]);

  useEffect(() => {
    load();
    return () => { abortRef.current?.abort(); };
  }, [load]);

  const updateStatus = async (rid: string, sts: "C" | "X" | "P") => {
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ rid, sts }),
      });
      if (res.ok) {
        setReservations(prev => prev.map(r => r.rid === rid ? { ...r, sts } : r));
      }
    } catch { /* silent */ }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["", "P", "C", "X"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-widest transition-all
              ${filter === f ? "border border-wisteria/40 bg-wisteria/20 text-wisteria" : "border border-line text-ink-faint hover:border-wisteria/30"}`}>
            {f === "" ? "All" : STS_RSV[f]}
          </button>
        ))}
        <button onClick={load} className="ml-auto rounded-full border border-line px-4 py-1.5 text-xs text-ink-faint hover:border-wisteria/30">↻ Refresh</button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-wisteria/5" />)}</div>
      ) : reservations.length === 0 ? (
        <p className="text-sm text-ink-faint">No reservations{filter ? ` with status ${STS_RSV[filter]}` : ""}.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r.rid} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{r.nam}</p>
                    <span className="text-[0.6rem] uppercase tracking-widest" style={{ color: STS_RSV_COLOR[r.sts] }}>
                      {STS_RSV[r.sts]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {r.dat} · {r.tim.slice(0, 5)} · {r.pax} guest{r.pax > 1 ? "s" : ""} · <span className="capitalize">{r.evt.replace("-", " ")}</span>
                  </p>
                  {r.msg && <p className="mt-1 text-xs text-ink-faint/70 italic">&ldquo;{r.msg}&rdquo;</p>}
                </div>
                {/* Status actions */}
                <div className="flex shrink-0 flex-col gap-1.5">
                  {r.sts !== "C" && (
                    <button onClick={() => updateStatus(r.rid, "C")}
                      className="rounded-lg border border-green-900/50 bg-green-950/20 px-3 py-1 text-[0.65rem] text-green-400 hover:bg-green-950/40">
                      Confirm
                    </button>
                  )}
                  {r.sts !== "X" && (
                    <button onClick={() => updateStatus(r.rid, "X")}
                      className="rounded-lg border border-red-900/30 bg-red-950/10 px-3 py-1 text-[0.65rem] text-red-400 hover:bg-red-950/25">
                      Cancel
                    </button>
                  )}
                  {r.sts !== "P" && (
                    <button onClick={() => updateStatus(r.rid, "P")}
                      className="rounded-lg border border-line px-3 py-1 text-[0.65rem] text-ink-faint hover:border-wisteria/30">
                      Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Menu Editor ───────────────────────────────────────────────────
function MenuEditor({ adminKey }: { adminKey: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems]           = useState<MenuItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activecat, setActivecat]   = useState("");
  const [editing, setEditing]       = useState<string | null>(null); // item id
  const [editName, setEditName]     = useState("");
  const [editPrice, setEditPrice]   = useState("");
  const [editSig, setEditSig]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [savedId, setSavedId]       = useState<string | null>(null);
  const abortRef  = useRef<AbortController | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Why: load() does NOT need activecat as a dep — it fetches ALL items once.
  // activecat is only used for UI filtering (visible = items.filter(...)).
  // Having activecat in the dep caused load() to re-fetch on every tab click.
  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/menu", {
        headers: { "x-admin-key": adminKey },
        signal: ctrl.signal,
      });
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories ?? []);
      setItems(data.items ?? []);
      // Set first category only if none is active yet — read current activecat via state updater
      setActivecat(prev => (prev || (data.categories?.[0]?.id ?? "")));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [adminKey]); // activecat removed — not needed here

  useEffect(() => {
    load();
    return () => {
      abortRef.current?.abort();
      // Why: clear saved-indicator timer on unmount to prevent setState after tab switch
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, [load]);

  const startEdit = (item: MenuItem) => {
    setEditing(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditSig(item.isSignature);
  };

  const saveEdit = async (id: string) => {
    const price = parseFloat(editPrice);
    if (!editName.trim() || isNaN(price) || price <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ id, name: editName.trim(), price, isSignature: editSig }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems(prev => prev.map(i => i.id === id
          ? { ...i, name: updated.name, price: updated.price, isSignature: updated.isSignature }
          : i
        ));
        setSavedId(id);
        // Why: store timeout ID so it can be cancelled if component unmounts within 2s
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSavedId(null), 2000);
        setEditing(null);
      }
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const visible = items.filter(i => i.category === activecat);

  return (
    <div className="flex flex-col gap-5">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button key={c.id} onClick={() => { setActivecat(c.id); setEditing(null); }}
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-widest transition-all
              ${activecat === c.id ? "border border-wisteria/40 bg-wisteria/20 text-wisteria" : "border border-line text-ink-faint hover:border-wisteria/30"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-wisteria/5" />)}</div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-ink-faint">No items in this category.</p>
      ) : (
        <div className="space-y-2">
          {visible.map(item => (
            <div key={item.id} className="rounded-xl border border-line bg-surface p-3">
              {editing === item.id ? (
                /* Edit mode */
                <div className="flex flex-col gap-3">
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="res-input rounded-lg border border-wisteria/40 bg-void px-3 py-2 text-sm text-ink"
                    placeholder="Item name" />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-faint">Rs</span>
                      <input type="number" min="1" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                        className="res-input w-28 rounded-lg border border-wisteria/40 bg-void px-3 py-2 text-sm text-ink" />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-ink-soft cursor-pointer">
                      <input type="checkbox" checked={editSig} onChange={e => setEditSig(e.target.checked)} className="accent-wisteria" />
                      Signature
                    </label>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => saveEdit(item.id)} disabled={saving}
                        className="rounded-lg border border-wisteria/40 bg-wisteria/15 px-4 py-1.5 text-xs text-wisteria hover:bg-wisteria/25 disabled:opacity-40">
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditing(null)}
                        className="rounded-lg border border-line px-4 py-1.5 text-xs text-ink-faint hover:border-wisteria/30">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm text-ink">{item.name}</p>
                      {item.isSignature && <span className="shrink-0 rounded-full bg-lantern/15 px-2 py-0.5 text-[0.55rem] uppercase tracking-widest text-lantern">★ Sig</span>}
                      {savedId === item.id && <span className="text-[0.6rem] text-green-400">✓ Saved</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-faint">{item.category}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <p className="font-medium text-ink">Rs {item.price.toLocaleString()}</p>
                    <button onClick={() => startEdit(item)}
                      className="rounded-lg border border-line px-3 py-1 text-xs text-ink-faint hover:border-wisteria/40 hover:text-wisteria">
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin Root ────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab,      setTab]      = useState<"scan" | "promoters" | "reservations" | "menu">("scan");
  const [verified, setVerified] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput) return;
    setChecking(true); setKeyError("");
    try {
      const res = await fetch("/api/admin/links", { headers: { "x-admin-key": keyInput } });
      if (res.ok) { setAdminKey(keyInput); setVerified(true); }
      else        { setKeyError("Wrong key. Try again."); }
    } catch { setKeyError("Network error. Try again."); }
    finally { setChecking(false); }
  };

  if (!verified) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-void px-6">
        <form onSubmit={handleKeySubmit} className="flex w-full max-w-xs flex-col gap-4">
          <div className="text-center">
            <p className="jp text-xs tracking-[0.4em] text-wisteria/60">無限城管理</p>
            <h1 className="mt-2 font-display text-2xl text-ink">Admin Access</h1>
          </div>
          <input type="password" value={keyInput} onChange={e => { setKeyInput(e.target.value); setKeyError(""); }}
            placeholder="Enter admin key" autoFocus
            className="res-input rounded-xl border border-line bg-void px-4 py-3 text-sm text-ink" />
          {keyError && <p className="text-xs text-red-400">{keyError}</p>}
          <button type="submit" disabled={!keyInput || checking}
            className="rounded-xl border border-wisteria/40 bg-wisteria/15 py-3 text-sm text-wisteria hover:bg-wisteria/25 disabled:opacity-40">
            {checking ? "Verifying…" : "Enter"}
          </button>
        </form>
      </main>
    );
  }

  const TABS = [
    { id: "scan",         label: "QR Scanner" },
    { id: "promoters",    label: "Promoters" },
    { id: "reservations", label: "Reservations" },
    { id: "menu",         label: "Menu" },
  ] as const;

  return (
    <main className="min-h-screen bg-void px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-2xl font-medium text-ink">Admin Panel</h1>
          <p className="jp text-xs text-ink-faint">無限城管理</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`rounded-full px-5 py-2 text-xs uppercase tracking-widest transition-all
                ${tab === t.id ? "border border-wisteria/40 bg-wisteria/20 text-wisteria" : "border border-line text-ink-faint hover:border-wisteria/30"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "scan"         && <ScanView adminKey={adminKey} />}
        {tab === "promoters"    && <PromoterDashboard adminKey={adminKey} />}
        {tab === "reservations" && <ReservationsInbox adminKey={adminKey} />}
        {tab === "menu"         && <MenuEditor adminKey={adminKey} />}
      </div>
    </main>
  );
}
