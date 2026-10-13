import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Durable storage for leads, owner settings, estimator versions, state eligibility,
 * team profiles and content overrides. SQLite works on any host with a persistent disk
 * (VPS, Render/Fly/Railway volume, Docker). On ephemeral serverless hosts, point
 * DATABASE_PATH at a mounted volume or swap this module for a managed database.
 */
const DB_PATH = resolve(process.env.DATABASE_PATH || "data/primed.db");

type DB = Database.Database;
const g = globalThis as unknown as { __primedDb?: DB };

function migrate(db: DB) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS seller_leads (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
      idempotency_key TEXT UNIQUE NOT NULL, inquiry_type TEXT NOT NULL,
      name TEXT, email TEXT, phone TEXT, preferred_contact TEXT,
      address TEXT, city TEXT, state TEXT, zip TEXT,
      property_type TEXT, condition TEXT, occupancy TEXT, bedrooms TEXT, bathrooms TEXT, sqft INTEGER,
      owner_arv INTEGER, owner_repairs INTEGER, timeline TEXT, preferred_date TEXT, deadline TEXT, urgent INTEGER DEFAULT 0,
      notes TEXT, estimate_id TEXT, estimate_json TEXT, model_version TEXT,
      source_page TEXT, utm_json TEXT, consent_json TEXT, extra_json TEXT, is_test INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS investor_leads (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
      idempotency_key TEXT UNIQUE NOT NULL,
      name TEXT, entity TEXT, email TEXT, phone TEXT, preferred_contact TEXT,
      markets TEXT, property_types TEXT, price_min INTEGER, price_max INTEGER, strategy TEXT,
      rehab_tolerance TEXT, timing TEXT, notes TEXT,
      source_page TEXT, utm_json TEXT, consent_json TEXT, is_test INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS estimates (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, mode TEXT NOT NULL, model_version TEXT,
      state TEXT, inputs_json TEXT NOT NULL, result_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS estimator_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, effective_date TEXT NOT NULL,
      config_json TEXT NOT NULL, change_note TEXT, created_at TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS state_config (abbr TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT, bio TEXT, photo_path TEXT, alt TEXT,
      display_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS content_overrides (slug TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS resources (
      slug TEXT PRIMARY KEY, json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY, lead_type TEXT NOT NULL, lead_id TEXT NOT NULL, target TEXT NOT NULL,
      payload_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, action TEXT NOT NULL, detail TEXT);
    CREATE TABLE IF NOT EXISTS lead_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT, lead_kind TEXT NOT NULL, lead_id TEXT NOT NULL, at TEXT NOT NULL,
      kind TEXT NOT NULL, body TEXT NOT NULL, seller_visible INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS lead_activity_lead ON lead_activity (lead_kind, lead_id, at);
  `);
  // Additive column migrations for databases created by earlier versions.
  const addColumn = (table: string, col: string, def: string) => {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  };
  addColumn("seller_leads", "status_token", "TEXT");
  addColumn("seller_leads", "follow_up_at", "TEXT");
  addColumn("seller_leads", "updated_at", "TEXT");
  addColumn("investor_leads", "follow_up_at", "TEXT");
  addColumn("investor_leads", "updated_at", "TEXT");
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS seller_leads_status_token ON seller_leads (status_token)");
}

export function db(): DB {
  if (!g.__primedDb) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    const d = new Database(DB_PATH);
    migrate(d);
    g.__primedDb = d;
  }
  return g.__primedDb;
}

export const nowIso = () => new Date().toISOString();

export function audit(action: string, detail?: string) {
  db().prepare("INSERT INTO audit_log (at, action, detail) VALUES (?, ?, ?)").run(nowIso(), action, detail ?? null);
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}
