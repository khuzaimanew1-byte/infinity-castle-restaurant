/**
 * schema.sql — Run once against each Neon DB to initialise tables.
 *
 * COUPON DB  (ep-aged-field-b5g8irel) → lnk, cpn
 * USER DB    (ep-floral-frog-b4jsk3gm) → usr
 *
 * Column names: max 4 characters
 * Status flags  (sts): A = Active | R = Redeemed | E = Expired
 * Discount type (typ): F = Fixed Rs | P = Percentage %
 */

-- ──────────────────────────────────────────────────────────────
-- COUPON DATABASE
-- ──────────────────────────────────────────────────────────────

-- lnk: Promoter / Affiliate links
-- Fix: added dsc + typ columns so each link carries its pre-assigned discount,
--      which is inherited by any coupon issued via that link.
CREATE TABLE IF NOT EXISTS lnk (
  lid  TEXT          PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  ref  TEXT          NOT NULL UNIQUE,           -- unreadable slug e.g. x8f2m9
  nam  TEXT          NOT NULL,                  -- promoter display name
  dsc  NUMERIC(8,2)  NOT NULL,                  -- pre-assigned discount value
  typ  CHAR(1)       NOT NULL CHECK (typ IN ('F','P')),  -- discount type
  cnt  INTEGER       NOT NULL DEFAULT 0,        -- link visits
  clm  INTEGER       NOT NULL DEFAULT 0,        -- coupons claimed
  com  NUMERIC(10,2) NOT NULL DEFAULT 0,        -- total commission paid out
  crt  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lnk_ref_idx ON lnk (ref);

-- cpn: Issued coupons
CREATE TABLE IF NOT EXISTS cpn (
  cid  TEXT         PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  uid  TEXT         NOT NULL,                   -- usr.uid (cross-db, text only)
  lid  TEXT         NOT NULL REFERENCES lnk(lid) ON DELETE RESTRICT,
  sec  CHAR(4)      NOT NULL UNIQUE,            -- 4-char secret code under QR
  dsc  NUMERIC(8,2) NOT NULL,                   -- discount value (amount or %)
  typ  CHAR(1)      NOT NULL CHECK (typ IN ('F','P')),
  sts  CHAR(1)      NOT NULL DEFAULT 'A' CHECK (sts IN ('A','R','E')),
  bil  NUMERIC(10,2),                           -- settled bill amount (nullable)
  com  NUMERIC(10,2),                           -- promoter commission paid (nullable)
  rdt  TIMESTAMPTZ,                             -- redeemed timestamp (nullable)
  crt  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cpn_uid_idx ON cpn (uid);
CREATE INDEX IF NOT EXISTS cpn_sec_idx ON cpn (sec);
CREATE INDEX IF NOT EXISTS cpn_lid_idx ON cpn (lid);
CREATE INDEX IF NOT EXISTS cpn_sts_idx ON cpn (sts);

-- rsv: Table reservations from the home page Reservation form
-- Stored alongside coupons in Coupon DB (no auth required to submit)
-- sts: P = Pending | C = Confirmed | X = Cancelled
CREATE TABLE IF NOT EXISTS rsv (
  rid  TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  nam  TEXT        NOT NULL,                  -- guest name
  pax  SMALLINT    NOT NULL CHECK (pax >= 1 AND pax <= 50),  -- guest count
  dat  DATE        NOT NULL,                  -- reservation date
  tim  TIME        NOT NULL,                  -- reservation time
  evt  TEXT        NOT NULL DEFAULT 'casual', -- event type id
  msg  TEXT,                                  -- optional description/note
  sts  CHAR(1)     NOT NULL DEFAULT 'P' CHECK (sts IN ('P','C','X')),
  crt  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rsv_dat_idx ON rsv (dat);
CREATE INDEX IF NOT EXISTS rsv_sts_idx ON rsv (sts);

-- mnu: Admin overrides for menu items (only changed rows stored)
-- Static defaults live in src/data/menu.ts — DB only stores diffs
CREATE TABLE IF NOT EXISTS mnu (
  mid  TEXT          PRIMARY KEY,              -- matches MenuItem.id in menu.ts
  nam  TEXT          NOT NULL,                 -- overridden name
  prc  NUMERIC(8,2)  NOT NULL,                 -- overridden price
  sig  BOOLEAN       NOT NULL DEFAULT FALSE,   -- signature flag
  upd  TIMESTAMPTZ   NOT NULL DEFAULT NOW()    -- last updated
);

-- ──────────────────────────────────────────────────────────────
-- USER DATABASE
-- ──────────────────────────────────────────────────────────────

-- usr: Google-authenticated user profiles + sliding session
CREATE TABLE IF NOT EXISTS usr (
  uid  TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  gid  TEXT        NOT NULL UNIQUE,             -- Google subject ID
  eml  TEXT        NOT NULL UNIQUE,             -- Gmail address
  nam  TEXT        NOT NULL,                    -- display name
  tok  TEXT        NOT NULL,                    -- session token (hashed)
  lgn  TIMESTAMPTZ NOT NULL DEFAULT NOW(),      -- last active
  exp  TIMESTAMPTZ NOT NULL,                    -- session expiry (180-day sliding)
  crt  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS usr_gid_idx ON usr (gid);
CREATE INDEX IF NOT EXISTS usr_tok_idx ON usr (tok);
CREATE INDEX IF NOT EXISTS usr_exp_idx ON usr (exp);
