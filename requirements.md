# Infinity Castle Dining — Mystery Coupon & Affiliate System
## Technical Requirements & Architecture Specification (`requirements.md`)

---

### 1. Developer Autonomy & Situational Optimization Directive
* **Full Architectural Freedom:** Full authorization to proactively apply situational UI/UX improvements, database normalization, caching strategies, and performance optimizations.
* **Execution Rule:** Optimize dynamically during implementation without blocking on trivial design confirmations while strictly preserving functional business rules.

---

### 2. Dual Neon Database Isolation & Ultra-Lean Schemas
Dono databases isolated aur dedicated connections par chalenge:
* **Coupon & Affiliate DB:** `ep-aged-field-b5g8irel` (Referral links, coupons, redemptions).
* **User Accounts DB:** `ep-floral-frog-b4jsk3gm` (Google profiles, 6-month sliding sessions).

#### Database Normalization & Storage Reduction Rules
1. **Zero Text Redundancy:** Domains, routes (`/c/`, `/v/`), and static text are NOT stored in table rows. Kept in code constants.
2. **Column Names (Max 3–4 Letters):**
   * **`lnk` (Promoter Links):**
     * `lid`: Link/Promoter ID
     * `ref`: Unreadable slug (e.g. `x8f2m9`)
     * `nam`: Promoter display name
     * `cnt`: Visit count (int)
     * `clm`: Claim count (int)
     * `com`: Accrued commission (numeric)
     * `crt`: Timestamp
   * **`cpn` (Coupons):**
     * `cid`: Coupon ID
     * `uid`: User ID
     * `lid`: Promoter Link ID
     * `sec`: 4-character secret code (under QR)
     * `dsc`: Pre-assigned discount value (e.g. `300` or `15`)
     * `typ`: Discount type flag (`F` = Fixed Rs, `P` = Percentage)
     * `sts`: Status flag (`A` = Active, `R` = Redeemed, `E` = Expired)
     * `bil`: Settled bill amount (numeric, nullable)
     * `com`: Paid promoter commission (numeric, nullable)
     * `rdt`: Redeemed timestamp (nullable)
     * `crt`: Timestamp
   * **`usr` (User Profiles):**
     * `uid`: User ID
     * `gid`: Google Subject ID
     * `eml`: Gmail address
     * `nam`: Full name
     * `tok`: Session token
     * `lgn`: Last active timestamp
     * `exp`: Session expiry (180 days)
     * `crt`: Timestamp
3. **1-Character Flags:** Status strictly `A` / `R` / `E`. Type strictly `F` / `P`. UI maps to readable words at runtime.
4. **4-Character Unique Secret Code:**
   * Alphanumeric + special characters `[0-9A-Za-z!@#$%&*]` (~70 base characters).
   * 70⁴ = ~24 Million combinations.
   * **Strict Constraint:** Do not increase length beyond 4 characters until combinations are exhausted.

---

### 3. Authentication & Sliding Session
* **Google (Gmail) 1-Tap OAuth:** No passwords or manual phone inputs.
* **6-Month Persistence:** Session valid for 180 days (`exp`).
* **Sliding Window:** Re-visiting refreshes expiration by another 180 days.
* **Single-Claim Anti-Abuse:** 1 active coupon per Google account across the platform.

---

### 4. Promoter Link & Coupon Experience
* **Link Structure:** `/c/[unreadable-id]` generated from Admin.
* **Visual Theme:** Consistent with site palette (`void`, `timber`, `wisteria`, `lantern`, Japanese typography).
* **Pre-Login State:** Shows mysterious sealed dining pass with talisman lock ("封印"). QR is hidden.
* **Post-Login State:**
  * Unlocks real mathematical scannable QR (via `qrcode` library, never CSS flexbox).
  * Displays pre-assigned discount (e.g. "Rs 300 OFF" or "15% OFF").
  * Shows 4-character secret code directly beneath QR (e.g. `#7$Kp`).
  * Displays in-card "Download Pass" action.
* **Duplicate Link Access (Psychological Messaging):**
  * If user opens another promoter's link, no error is displayed.
  * Shows punchy, positive status: *"Special reward already claimed! Your pass is active below."* with direct view of existing coupon.

---

### 5. Client-Side Image Download (Zero Cloud Storage)
* **Format:** Strict Image ONLY (`.png` / `.jpg`). No PDF.
* **Execution:** HTML5 Canvas renders ticket on-the-fly and triggers browser blob download.
* **Zero Cost:** Zero cloud storage / R2 storage usage for coupon images.

---

### 6. Verification & Admin QR Settlement Flow
* **Normal Phone Camera Scan:**
  * Opens public verification URL: `/v/[sec]`.
  * Simple, clear text: *"Infinity Castle Dining — Staff will scan this at billing."*
  * Prevents unauthorized redemptions.
* **Admin Scanner Screen:**
  * Dual input: Live camera QR reader + Manual 4-character Dial-pad.
  * Admin inputs Total Bill Amount (`bil`).
  * **Negative Bill Guard:** Bill amount must be greater than discount (`bil >= dsc`); negative bill impossible.
  * System deducts pre-assigned discount (`dsc`), shows final payable amount, and records promoter commission (`com`).
  * Status set to `R` (Redeemed).

---

### 7. Copywriting Standard
* **Tone:** Short, clean, punchy, commonly readable English/Roman Urdu.
* **Zero Fluff:** No overly long fantasy texts. Immediate understanding for restaurant staff and diners.

---

### 8. Smart Request Strategy (Client & Edge Engine)
* **Queue & Memory:**
  * Requests queued in browser `IndexedDB`.
  * Strict limit: Max 3 active concurrent requests in RAM; only requested projection fields loaded.
  * Tab close flushes active RAM to `IndexedDB`; resumes on return.
  * Auto-purge: Completed jobs and caches >1hr cleaned every 5 min; emergency low-priority purge if storage >80%.
* **Adaptive Batching:**
  * 1–3 requests: 100ms
  * 4–15 requests: 500ms (batches of 3)
  * 16–40 requests: 1,000ms (batches of 8)
  * 41–100 requests: 2,000ms (batches of 15)
  * 100+ requests: 3,000ms + backpressure (batches of 25)
* **Chunking:** Payloads ≥50KB sliced into 50KB parallel chunks; retries target only failed chunks.
* **Deduplication & Caching:** In-flight duplicate requests share one promise; 30-second local query cache.
* **Priority Engine:**
  * P0 Critical: Auth, QR Redemption (bypasses queue)
  * P1 High: Coupon Claim, Login
  * P2 Normal: Promoter Stats, Menu
  * P3 Low: Analytics, Prefetch (dropped during network flood)
* **Circuit Breaker:**
  * 5 consecutive errors → OPEN for 10s.
  * 1 test probe: success → CLOSED; failure → OPEN for 20s.
  * Exponential backoff: `1s → 2s → 4s → 8s` (max 3 retries, 30s timeout).
* **Payload Compression:** Gzip payloads ≥1KB, strip `null`/`undefined` keys; binary handled strictly via `ArrayBuffer` (no Base64).
