// SQLite database using Node's built-in driver (no native build needed).
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config } from './config.js';

const file = resolve(config.dbPath);
mkdirSync(dirname(file), { recursive: true });

export const db = new DatabaseSync(file);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS reservations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    email       TEXT,
    date        TEXT    NOT NULL,          -- YYYY-MM-DD
    time        TEXT    NOT NULL,          -- HH:MM (24h)
    guests      INTEGER NOT NULL,
    occasion    TEXT,
    notes       TEXT,
    status      TEXT    NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','confirmed','seated','cancelled')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    phone       TEXT,
    email       TEXT,
    topic       TEXT    NOT NULL DEFAULT 'general',
    message     TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','read','done')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    category      TEXT    NOT NULL CHECK (category IN ('restaurant','bakery','sweets')),
    name          TEXT    NOT NULL,
    description   TEXT,
    price         INTEGER,                 -- rupees; NULL = not shown
    unit          TEXT,                    -- e.g. "per kg", "per plate"
    is_signature  INTEGER NOT NULL DEFAULT 0,
    is_available  INTEGER NOT NULL DEFAULT 1,
    is_sample     INTEGER NOT NULL DEFAULT 0, -- 1 = starter item added by the developer
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_res_date   ON reservations(date, time);
  CREATE INDEX IF NOT EXISTS idx_res_status ON reservations(status);
  CREATE INDEX IF NOT EXISTS idx_msg_status ON messages(status);
  CREATE INDEX IF NOT EXISTS idx_menu_cat   ON menu_items(category, sort_order);
`);

/** Turn SQLite 0/1 flags into booleans for the JSON API. */
export function toMenuItem(row) {
  if (!row) return row;
  return {
    ...row,
    is_signature: Boolean(row.is_signature),
    is_available: Boolean(row.is_available),
    is_sample: Boolean(row.is_sample),
  };
}
