# Infinity Castle Dining — Mystery Coupon & Affiliate System
## Requirements & Technical Specification Document (`requirements.md`)

---

### 1. Executive Summary & Objective
Build an automated, high-performance **Affiliate Mystery Coupon System** for *Infinity Castle Dining* seamlessly integrated with the existing frontend design system and dual Neon PostgreSQL databases. 

The system allows the restaurant admin to generate unique, unreadable referral links for promoters/influencers/staff, track customer acquisition per promoter, offer authenticated customers mystery discounts on their dining bills, generate downloadable image coupons with secure QR codes, and allow the admin to scan, verify, and allocate bill discounts and promoter commissions.

---

### 2. Core Functional Requirements

#### A. Affiliate / Promoter Referral Links
- **Link Generation:** Admin creates a referral link for a specific promoter (staff member, influencer, or marketer).
- **Unreadable Slug / ID:** The link uses an obfuscated, non-sequential unreadable token (e.g., `/c/x8f2m9q1k` or `/claim/v1-7a8e9b`).
- **Attribution & Tracking:** Each link maps directly to the promoter's record, tracking:
  - Total visits / link openings
  - Total claimed coupons
  - Total redeemed coupons
  - Total dining revenue generated
  - Accumulated promoter commission/benefits

#### B. The Mystery Coupon Page (`/c/[slug]`)
- **Visual Consistency:** Matches the exact high-end Demon Slayer theme of Infinity Castle Dining (`#0B0906` void, `#130E0B` timber, `#8961D9` wisteria, `#D4935A` lantern, Japanese typography `Noto Serif JP` & `Playfair Display`).
- **Mystery Element:** The coupon provides a surprise discount amount (e.g., Rs 200, Rs 500, 15%, 25% off) applicable at the restaurant upon bill settlement.
- **Initial State (Unauthenticated):**
  - Displays the Mystery Coupon ticket visual with mysterious glowing seal ("封印").
  - **No QR Code** is revealed prior to authentication.
  - Clear prompt: *"Login to unlock your exclusive QR code and claim discount"*.
- **Anti-Abuse Rule (Single Claim per Account):**
  - If a user who has already claimed a coupon from this campaign opens the link with the same account, a duplicate coupon is **NOT** issued.
  - The UI informs them of their existing active coupon or past redemption.

#### C. User Authentication & 6-Month Sliding Session
- **Dedicated User Auth DB:** Operates on the separate User Neon DB (`ep-floral-frog-b4jsk3gm`).
- **Session Duration:** 
  - Login session persists for **6 months (180 days)**.
  - **Sliding Expiration:** Every time the user revisits the site, the session expiration extends by another 6 months.
- **Authenticated State:**
  - Mystery discount value is revealed.
  - Cryptographically signed special **QR Code** is rendered dynamically.
  - Prominent **"Download Coupon"** action is unlocked.

#### D. Coupon Download (Strict Image Format)
- **Format Constraint:** **Image format ONLY** (`.png` / `.jpg`). No PDFs or text files.
- **Visual Design:** Renders a high-resolution, printable/saveable Japanese castle ticket with:
  - Restaurant watermark & branding (無限城)
  - Mystery discount amount
  - Scannable QR code containing secure verification payload
  - Coupon ID & expiry notice
- **Client-Side Generation:** Rendered via HTML5 Canvas / DOM-to-image to prevent server load.

#### E. Admin Portal & QR Scanner Flow
- **Scanner Interface:** Admin opens scanner (camera / handheld scanner) on mobile or POS screen.
- **Verification on Scan:**
  1. Admin scans customer's QR code.
  2. System validates coupon authenticity, status (`ACT` = Active), and expiration.
  3. Form prompts Admin for:
     - **Total Bill Amount (`bil`)**
     - **Customer Discount Amount (`dsc`)** (applied to bill)
     - **Promoter Commission / Reward (`com`)** (credited to promoter)
  4. Once confirmed:
     - Coupon status transitions to `RED` (Redeemed).
     - Customer bill is discounted.
     - Promoter stats are credited and organized under their account dashboard.

---

### 3. Database Architecture & Ultra-Lean Optimization

#### A. Dual Neon PostgreSQL Isolation
| Database Role | Neon Database Host | Responsibility |
|---|---|---|
| **Coupon & Affiliate DB** | `ep-aged-field-b5g8irel` | Referral links, coupons, redemptions, commissions |
| **User Auth DB** | `ep-floral-frog-b4jsk3gm` | User profiles, credentials, 6-month sliding sessions |

#### B. Database Optimization Rules
1. **3–4 Letter Field Names (Maximum Compactness):**
   - Saves row size, network transport overhead, and Neon RAM consumption.
   - **Promoter / Link Schema (`lnk`):**
     - `lid`: Link / Promoter ID (varchar)
     - `ref`: Unreadable referral token (varchar)
     - `nam`: Promoter name (varchar)
     - `cnt`: Click count (int)
     - `clm`: Claim count (int)
     - `com`: Total commission earned (numeric)
     - `crt`: Created timestamp (timestamp)
   - **Coupon Schema (`cpn`):**
     - `cid`: Coupon unique ID (varchar)
     - `uid`: User ID from Auth DB (varchar)
     - `lid`: Link ID attribution (varchar)
     - `qrc`: Cryptographic QR signature (varchar)
     - `dsc`: Discount value / rate (numeric)
     - `sts`: Status code (`ACT`, `RED`, `EXP`, `LOK`)
     - `bil`: Redeemed bill amount (numeric, nullable)
     - `com`: Promoter commission allocated (numeric, nullable)
     - `exp`: Expiry timestamp (timestamp)
     - `rdt`: Redeemed timestamp (timestamp, nullable)
     - `crt`: Created timestamp (timestamp)
   - **User Schema (`usr`):**
     - `uid`: User ID (varchar)
     - `phn`: Phone number / identifier (varchar)
     - `pwd`: Password hash (varchar)
     - `tok`: Sliding session token (varchar)
     - `lgn`: Last active timestamp (timestamp)
     - `exp`: Session expiration timestamp (timestamp, 6 months sliding)
     - `crt`: Created timestamp (timestamp)

2. **Short-Code Constants with Code-Level Mappings:**
   - Database stores short 3-letter codes:
     - `ACT` → `Active`
     - `RED` → `Redeemed`
     - `EXP` → `Expired`
     - `LOK` → `Locked`
     - `PCT` → `Percentage`
     - `FIX` → `Fixed Amount`
   - Application layer maps codes to full descriptive UI text, keeping DB footprint microscopic while user sees polished English.

---

### 4. Smart Request Strategy Specification

To minimize origin trips, protect the Neon database, and provide instant response times under heavy public traffic:

#### 1. Queue & Memory Management
- **Persistence:** Requests persisted in browser `IndexedDB`.
- **RAM Limiter:** Strict limit of **3 active concurrent requests** in RAM. Requests fetch only requested projection fields, never complete entities.
- **Lifecycle:** Upon completion, requests are removed from both RAM and `IndexedDB`.
- **Tab Close:** Flushes active memory to `IndexedDB`; resumes pending requests seamlessly upon return.
- **Auto-Purge:** Every 5 minutes, sweep completed requests and cache entries older than 1 hour. If `IndexedDB` storage usage exceeds 80%, purge oldest low-priority records.

#### 2. Adaptive Batching Engine
| Pending Requests | Dispatch Interval | Batch Size |
|---|---|---|
| **1 – 3** | Immediate (100ms debounce) | Direct |
| **4 – 15** | 500ms delay | Batches of 3 |
| **16 – 40** | 1,000ms delay | Batches of 8 |
| **41 – 100** | 2,000ms delay | Batches of 15 |
| **100+** | 3,000ms delay + Backpressure applied | Batches of 25 |

#### 3. Payload Chunking
- Payloads **≥ 50 KB** are automatically divided into **50 KB parallel chunks**.
- Retries target only failed chunks, avoiding re-transmitting entire bodies.

#### 4. Deduplication & Cache
- In-flight or queued identical requests are deduplicated and share a single network response.
- Query responses cached for **30 seconds** locally; subsequent hits served instantly without touching the backend or database.

#### 5. Request Priority Matrix
- **P0 Critical:** Authentication, Session Refresh, Admin QR Redemption (Bypasses queue instantly).
- **P1 High:** Coupon Claim, User Login (Next scheduled batch).
- **P2 Normal:** Promoter Link Stats, Public Menu & Site data (Standard queue).
- **P3 Low:** Analytics, Prefetching (Idle time only; dropped during network floods).

#### 6. Circuit Breaker & Resilient Retries
- **Trip Condition:** 5 consecutive failures trips state to `OPEN` for **10 seconds**.
- **Half-Open Test:** 1 test probe request dispatched:
  - If success → transition to `CLOSED`.
  - If failure → transition to `OPEN` for **20 seconds**.
- **Retry Backoff:** Exponential delays: `1s → 2s → 4s → 8s` (Maximum 3 retries, 30s timeout).

#### 7. Data Compression & Payload Minimization
- Payloads **≥ 1 KB** are gzipped; recursive utility strips all `null` and `undefined` keys before transmission.
- Binary media / QR downloads handled strictly as `ArrayBuffer` (never Base64 strings).

---

### 5. Implementation Roadmap & Milestones

- **Phase A:** Environment & Database Schema Setup (Prisma/SQL schemas for both Neon DBs with 3-letter fields).
- **Phase B:** Smart Request Client Engine (IndexedDB queue, priority dispatcher, circuit breaker, batcher).
- **Phase C:** Mystery Coupon Claim Page (`/c/[slug]`) with authentic Demon Slayer styling.
- **Phase D:** 6-Month Auth Flow & Dynamic QR Generation.
- **Phase E:** High-Resolution Image Coupon Downloader (Canvas/Image exporter).
- **Phase F:** Admin QR Scanner & Promoter Commission Attribution Dashboard.
