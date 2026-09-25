/**
 * requestEngine.ts — Client-side Smart Request Queue & Network Engine.
 *
 * Implements the full Smart Request Strategy from requirements.md §8:
 *  - IndexedDB persistence (idb library)
 *  - Max 3 concurrent in-flight requests
 *  - Adaptive batching by queue depth
 *  - 50KB payload chunking
 *  - Deduplication + 30s response cache
 *  - P0–P3 priority levels
 *  - Circuit breaker (5 errors → OPEN)
 *  - Exponential backoff retries (1s→2s→4s→8s)
 *  - gzip-strip payload compression
 *  - Auto-purge every 5 min; emergency purge at >80% storage
 */

import { openDB, IDBPDatabase } from "idb";

// ── Types ─────────────────────────────────────────────────────────
export type Priority = 0 | 1 | 2 | 3; // P0=Critical, P1=High, P2=Normal, P3=Low

export interface QRequest {
  id:       string;
  url:      string;
  method:   string;
  body?:    unknown;
  headers?: Record<string, string>;
  priority: Priority;
  attempt:  number;
  created:  number;
  status:   "queued" | "done" | "failed";
}

type CacheEntry = { data: unknown; ts: number };

// ── Constants ─────────────────────────────────────────────────────
const DB_NAME   = "ic-req-queue";
const DB_VER    = 1;
const STORE     = "reqs";
const MAX_INFLIGHT  = 3;
const CACHE_TTL     = 30_000;        // 30s
const PURGE_INT     = 5 * 60_000;   // 5 min
const CACHE_AGE_MAX = 60 * 60_000;  // 1 hr
const CHUNK_SIZE    = 50 * 1024;    // 50 KB
const BACKOFFS      = [1000, 2000, 4000, 8000];
const CB_THRESHOLD  = 5;            // errors before OPEN
const CB_OPEN_MS    = 10_000;       // 10s
const CB_HALF_MS    = 20_000;       // 20s after probe fail

// Adaptive batch window (ms) by queue depth
function batchDelay(depth: number): number {
  if (depth <= 3)  return 100;
  if (depth <= 15) return 500;
  if (depth <= 40) return 1000;
  if (depth <= 100) return 2000;
  return 3000;
}

// ── State ─────────────────────────────────────────────────────────
let _db:        IDBPDatabase | null = null;
let _inflight   = 0;
let _batchTimer: ReturnType<typeof setTimeout> | null = null;
const _cache    = new Map<string, CacheEntry>();
const _inFlight = new Map<string, Promise<unknown>>(); // dedup map
let _cbErrors   = 0;
let _cbState: "CLOSED" | "OPEN" | "HALF" = "CLOSED";
let _cbOpenUntil = 0;

// ── DB init ───────────────────────────────────────────────────────
async function db(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VER, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: "id" });
        s.createIndex("status",   "status");
        s.createIndex("priority", "priority");
        s.createIndex("created",  "created");
      }
    },
  });
  // flush on page close
  window.addEventListener("pagehide", () => { _db?.close(); _db = null; });
  return _db;
}

// ── Compression — strip nulls recursively ─────────────────────────
function stripNulls(obj: unknown): unknown {
  if (obj === null || obj === undefined) return undefined;
  if (Array.isArray(obj)) return obj.map(stripNulls).filter(v => v !== undefined);
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k, stripNulls(v)])
    );
  }
  return obj;
}

async function compress(payload: string): Promise<BodyInit> {
  if (payload.length < 1024) return payload;
  const stream = new CompressionStream("gzip");
  const writer = stream.writable.getWriter();
  writer.write(new TextEncoder().encode(payload));
  writer.close();
  return new Response(stream.readable).arrayBuffer();
}

// ── Circuit breaker ───────────────────────────────────────────────
function cbAllow(): boolean {
  const now = Date.now();
  if (_cbState === "CLOSED") return true;
  if (_cbState === "OPEN") {
    if (now >= _cbOpenUntil) { _cbState = "HALF"; return true; } // probe
    return false;
  }
  return true; // HALF allows 1 probe
}

function cbSuccess() { _cbErrors = 0; _cbState = "CLOSED"; }
function cbFailure() {
  _cbErrors++;
  if (_cbState === "HALF") {
    _cbState = "OPEN";
    _cbOpenUntil = Date.now() + CB_HALF_MS;
  } else if (_cbErrors >= CB_THRESHOLD) {
    _cbState = "OPEN";
    _cbOpenUntil = Date.now() + CB_OPEN_MS;
  }
}

// ── Single fetch with retry + chunking ───────────────────────────
async function execRequest(req: QRequest): Promise<unknown> {
  const cacheKey = `${req.method}:${req.url}:${JSON.stringify(req.body ?? "")}`;

  // P3 silent drop on CB open
  if (!cbAllow()) {
    if (req.priority === 3) return null;
    throw new Error("Circuit open");
  }

  // Cache hit (GET-equivalent reads)
  if (req.method === "GET") {
    const cached = _cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  }

  const bodyStr = req.body ? JSON.stringify(stripNulls(req.body)) : undefined;

  // Chunked upload
  if (bodyStr && bodyStr.length >= CHUNK_SIZE) {
    return execChunked(req, bodyStr);
  }

  const body = bodyStr ? await compress(bodyStr) : undefined;
  const headers: Record<string, string> = {
    ...req.headers,
    ...(bodyStr && bodyStr.length >= 1024 && { "Content-Encoding": "gzip" }),
    ...(bodyStr && { "Content-Type": "application/json" }),
  };

  const timeout = AbortSignal.timeout(30_000);
  const res = await fetch(req.url, { method: req.method, headers, body, signal: timeout });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  cbSuccess();
  const data = await res.json();
  if (req.method === "GET") _cache.set(cacheKey, { data, ts: Date.now() });
  return data;
}

async function execChunked(req: QRequest, bodyStr: string): Promise<unknown> {
  const chunks: string[] = [];
  for (let i = 0; i < bodyStr.length; i += CHUNK_SIZE) {
    chunks.push(bodyStr.slice(i, i + CHUNK_SIZE));
  }
  const uploadId = `${req.id}-${Date.now()}`;
  await Promise.all(
    chunks.map(async (chunk, idx) => {
      let attempt = 0;
      while (attempt < BACKOFFS.length) {
        try {
          const res = await fetch(req.url, {
            method: req.method,
            headers: {
              ...req.headers,
              "Content-Type": "application/json",
              "X-Chunk-Upload-Id": uploadId,
              "X-Chunk-Index": String(idx),
              "X-Chunk-Total": String(chunks.length),
            },
            body: chunk,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return;
        } catch {
          if (attempt === BACKOFFS.length - 1) throw new Error(`Chunk ${idx} failed`);
          await new Promise(r => setTimeout(r, BACKOFFS[attempt++]));
        }
      }
    })
  );
  return { chunked: true, uploadId };
}

// ── Dispatcher ───────────────────────────────────────────────────
async function dispatch() {
  if (_inflight >= MAX_INFLIGHT) return;
  const store = await db();
  // Pull by priority (0 first), then oldest
  const all = await store.getAllFromIndex(STORE, "status", "queued") as QRequest[];
  all.sort((a, b) => a.priority - b.priority || a.created - b.created);
  const slots = MAX_INFLIGHT - _inflight;
  const batch = all.slice(0, slots);
  for (const req of batch) {
    _inflight++;
    const key = `${req.method}:${req.url}`;
    // Deduplication
    if (_inFlight.has(key)) {
      _inFlight.get(key)!.then(async () => {
        req.status = "done";
        await (await db()).put(STORE, req);
        _inflight--;
      });
      continue;
    }
    const promise = (async () => {
      let attempt = 0;
      while (attempt <= BACKOFFS.length) {
        try {
          const data = await execRequest(req);
          req.status = "done";
          await (await db()).put(STORE, req);
          _inFlight.delete(key);
          _inflight--;
          return data;
        } catch {
          cbFailure();
          if (attempt < BACKOFFS.length) {
            await new Promise(r => setTimeout(r, BACKOFFS[attempt++]));
          } else {
            req.status = "failed";
            await (await db()).put(STORE, req);
            _inFlight.delete(key);
            _inflight--;
            return null;
          }
        }
      }
    })();
    _inFlight.set(key, promise as Promise<unknown>);
  }
}

// ── Public API ───────────────────────────────────────────────────
export async function enqueue(
  url: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
  priority: Priority = 2,
  headers?: Record<string, string>
): Promise<void> {
  // P0 bypass — direct immediate exec
  if (priority === 0) {
    const req: QRequest = { id: crypto.randomUUID(), url, method, body, headers, priority, attempt: 0, created: Date.now(), status: "queued" };
    await execRequest(req).catch(() => {});
    return;
  }
  const req: QRequest = {
    id:      crypto.randomUUID(),
    url, method, body, headers, priority,
    attempt: 0,
    created: Date.now(),
    status:  "queued",
  };
  await (await db()).add(STORE, req);
  // Adaptive batch delay
  const all = await (await db()).getAllFromIndex(STORE, "status", "queued");
  if (_batchTimer) clearTimeout(_batchTimer);
  _batchTimer = setTimeout(() => dispatch(), batchDelay(all.length));
}

// ── Auto-purge every 5 min ────────────────────────────────────────
async function autoPurge() {
  const store = await db();
  const all = await store.getAll(STORE) as QRequest[];
  const cutoff = Date.now() - CACHE_AGE_MAX;
  for (const req of all) {
    if (req.status === "done" || (req.status === "failed" && req.created < cutoff)) {
      await store.delete(STORE, req.id);
    }
  }
  // Cache purge
  for (const [k, v] of _cache) {
    if (Date.now() - v.ts > CACHE_AGE_MAX) _cache.delete(k);
  }
  // Emergency storage purge at >80%
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const { usage = 0, quota = 1 } = await navigator.storage.estimate();
    if (usage / quota > 0.8) {
      const p3 = all.filter(r => r.priority === 3).sort((a,b) => a.created - b.created);
      for (const r of p3.slice(0, Math.ceil(p3.length * 0.5))) {
        await store.delete(STORE, r.id);
      }
    }
  }
}

if (typeof window !== "undefined") {
  setInterval(autoPurge, PURGE_INT);
  // Resume pending on tab restore
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") dispatch();
  });
}
