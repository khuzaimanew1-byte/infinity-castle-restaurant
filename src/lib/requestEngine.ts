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
 *  - gzip payload compression
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
const DB_NAME       = "ic-req-queue";
const DB_VER        = 1;
const STORE         = "reqs";
const MAX_INFLIGHT  = 3;
const CACHE_TTL     = 30_000;       // 30s response cache
const PURGE_INT     = 5 * 60_000;  // auto-purge every 5 min
const CACHE_AGE_MAX = 60 * 60_000; // entries older than 1hr purged
const CHUNK_SIZE    = 50 * 1024;   // 50 KB chunk threshold
const BACKOFFS      = [1000, 2000, 4000, 8000] as const; // ms
const CB_THRESHOLD  = 5;           // consecutive errors before OPEN
const CB_OPEN_MS    = 10_000;      // OPEN duration
const CB_HALF_MS    = 20_000;      // OPEN duration after failed probe

function batchDelay(depth: number): number {
  if (depth <= 3)   return 100;
  if (depth <= 15)  return 500;
  if (depth <= 40)  return 1_000;
  if (depth <= 100) return 2_000;
  return 3_000;
}

// ── Module state (singleton per page) ────────────────────────────
let _db:         IDBPDatabase | null = null;
let _phHooked    = false;             // pagehide listener added once only
let _inflight    = 0;
let _batchTimer: ReturnType<typeof setTimeout> | null = null;
const _cache     = new Map<string, CacheEntry>();
const _inFlight  = new Map<string, Promise<unknown>>(); // dedup
let _cbErrors    = 0;
let _cbState: "CLOSED" | "OPEN" | "HALF" = "CLOSED";
let _cbOpenUntil = 0;

// ── DB init ───────────────────────────────────────────────────────
async function getDb(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VER, {
    upgrade(d) {
      if (!d.objectStoreNames.contains(STORE)) {
        const s = d.createObjectStore(STORE, { keyPath: "id" });
        s.createIndex("status",   "status");
        s.createIndex("priority", "priority");
        s.createIndex("created",  "created");
      }
    },
  });
  // Fix: guard pagehide listener to once — previously added on every
  // db() call if _db was null (e.g. after pagehide closed it), causing
  // multiple listeners accumulating over page lifetime.
  if (!_phHooked) {
    _phHooked = true;
    window.addEventListener("pagehide", () => { _db?.close(); _db = null; });
  }
  return _db;
}

// ── Compression — strip nulls + gzip ─────────────────────────────
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
  if (_cbState === "CLOSED") return true;
  if (_cbState === "OPEN") {
    if (Date.now() >= _cbOpenUntil) { _cbState = "HALF"; return true; }
    return false;
  }
  return true; // HALF: allow 1 probe
}
function cbSuccess() { _cbErrors = 0; _cbState = "CLOSED"; }
function cbFailure() {
  _cbErrors++;
  if (_cbState === "HALF") {
    _cbState    = "OPEN";
    _cbOpenUntil = Date.now() + CB_HALF_MS;
  } else if (_cbErrors >= CB_THRESHOLD) {
    _cbState    = "OPEN";
    _cbOpenUntil = Date.now() + CB_OPEN_MS;
  }
}

// ── Single fetch with retry ───────────────────────────────────────
async function execRequest(req: QRequest): Promise<unknown> {
  const cacheKey = `${req.method}:${req.url}:${JSON.stringify(req.body ?? "")}`;

  if (!cbAllow()) {
    if (req.priority === 3) return null; // P3 silently dropped when circuit open
    throw new Error("Circuit breaker OPEN");
  }

  if (req.method === "GET") {
    const cached = _cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  }

  const bodyStr = req.body ? JSON.stringify(stripNulls(req.body)) : undefined;

  if (bodyStr && bodyStr.length >= CHUNK_SIZE) {
    return execChunked(req, bodyStr);
  }

  const body    = bodyStr ? await compress(bodyStr) : undefined;
  const headers: Record<string, string> = {
    ...req.headers,
    ...(bodyStr && bodyStr.length >= 1024 ? { "Content-Encoding": "gzip" } : {}),
    ...(bodyStr ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(req.url, {
    method:  req.method,
    headers,
    body,
    signal:  AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  cbSuccess();
  const data = await res.json();
  if (req.method === "GET") _cache.set(cacheKey, { data, ts: Date.now() });
  return data;
}

// ── Chunked upload ────────────────────────────────────────────────
async function execChunked(req: QRequest, bodyStr: string): Promise<unknown> {
  const chunks: string[] = [];
  for (let i = 0; i < bodyStr.length; i += CHUNK_SIZE) {
    chunks.push(bodyStr.slice(i, i + CHUNK_SIZE));
  }
  const uploadId = `${req.id}-${Date.now()}`;
  await Promise.all(
    chunks.map(async (chunk, idx) => {
      for (let attempt = 0; attempt < BACKOFFS.length; attempt++) {
        try {
          const res = await fetch(req.url, {
            method:  req.method,
            headers: {
              ...req.headers,
              "Content-Type":      "application/json",
              "X-Chunk-Upload-Id": uploadId,
              "X-Chunk-Index":     String(idx),
              "X-Chunk-Total":     String(chunks.length),
            },
            body: chunk,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return; // chunk succeeded
        } catch (e) {
          if (attempt === BACKOFFS.length - 1) throw e; // all retries exhausted
          await new Promise(r => setTimeout(r, BACKOFFS[attempt]));
        }
      }
    })
  );
  return { chunked: true, uploadId };
}

// ── Dispatcher ────────────────────────────────────────────────────
async function dispatch() {
  if (_inflight >= MAX_INFLIGHT) return;
  const store = await getDb();
  const all   = (await store.getAllFromIndex(STORE, "status", "queued")) as QRequest[];
  all.sort((a, b) => a.priority - b.priority || a.created - b.created);
  const slots = MAX_INFLIGHT - _inflight;
  const batch = all.slice(0, slots);

  for (const req of batch) {
    _inflight++;
    const key = `${req.method}:${req.url}`;

    // Deduplication: if same URL+method is already in-flight, piggyback on it
    if (_inFlight.has(key)) {
      // Fix: piggyback correctly and always decrement _inflight regardless of outcome
      _inFlight.get(key)!
        .then(async () => {
          req.status = "done";
          await (await getDb()).put(STORE, req);
        })
        .catch(async () => {
          req.status = "failed";
          await (await getDb()).put(STORE, req);
        })
        .finally(() => { _inflight--; });
      continue;
    }

    const promise = (async () => {
      // Fix: loop was `attempt <= BACKOFFS.length` (off-by-one — ran 5 iterations
      // when BACKOFFS has 4 entries, causing undefined delay on 5th attempt).
      // Corrected to `attempt < BACKOFFS.length` (exactly 4 retry attempts).
      for (let attempt = 0; attempt < BACKOFFS.length; attempt++) {
        try {
          const data = await execRequest(req);
          req.status = "done";
          await (await getDb()).put(STORE, req);
          _inFlight.delete(key);
          _inflight--;
          return data;
        } catch {
          cbFailure();
          if (attempt < BACKOFFS.length - 1) {
            await new Promise(r => setTimeout(r, BACKOFFS[attempt]));
          } else {
            // All retries exhausted
            req.status = "failed";
            await (await getDb()).put(STORE, req);
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

// ── Public API ────────────────────────────────────────────────────
export async function enqueue(
  url:      string,
  method:   "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?:    unknown,
  priority: Priority = 2,
  headers?: Record<string, string>
): Promise<void> {
  // P0: bypass queue — execute immediately, blocking caller
  if (priority === 0) {
    const req: QRequest = {
      id: crypto.randomUUID(), url, method, body, headers,
      priority, attempt: 0, created: Date.now(), status: "queued",
    };
    await execRequest(req).catch(() => {});
    return;
  }

  const req: QRequest = {
    id: crypto.randomUUID(), url, method, body, headers,
    priority, attempt: 0, created: Date.now(), status: "queued",
  };
  const store = await getDb();
  await store.add(STORE, req);

  // Measure queue depth to pick batch delay
  const queued = await store.getAllFromIndex(STORE, "status", "queued");
  if (_batchTimer) clearTimeout(_batchTimer);
  _batchTimer = setTimeout(() => dispatch(), batchDelay(queued.length));
}

// ── Auto-purge every 5 min ────────────────────────────────────────
async function autoPurge() {
  const store  = await getDb();
  const all    = (await store.getAll(STORE)) as QRequest[];
  const cutoff = Date.now() - CACHE_AGE_MAX;

  for (const req of all) {
    if (req.status === "done" || (req.status === "failed" && req.created < cutoff)) {
      await store.delete(STORE, req.id);
    }
  }

  // In-memory cache purge
  for (const [k, v] of _cache) {
    if (Date.now() - v.ts > CACHE_AGE_MAX) _cache.delete(k);
  }

  // Emergency storage purge: drop 50% of P3 jobs if usage > 80%
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const { usage = 0, quota = 1 } = await navigator.storage.estimate();
    if (usage / quota > 0.8) {
      const p3 = all
        .filter(r => r.priority === 3 && r.status === "queued")
        .sort((a, b) => a.created - b.created);
      for (const r of p3.slice(0, Math.ceil(p3.length * 0.5))) {
        await store.delete(STORE, r.id);
      }
    }
  }
}

// ── Browser-only init ─────────────────────────────────────────────
if (typeof window !== "undefined") {
  setInterval(autoPurge, PURGE_INT);
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") dispatch();
  });
}
