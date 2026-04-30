// src/lib/server/db/index.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as systemSchema from './schema-system';
import * as orgSchema from './schema-org';
import { DEFAULT_CUSTOM_ROLES } from '$lib/constants/participant-status';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = process.env.DB_DIR || path.resolve('data');
const ORGS_DIR = path.join(DB_DIR, 'orgs');

// ============================================================
// Ensure directories exist
// ============================================================
function ensureDirs() {
	if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
	if (!fs.existsSync(ORGS_DIR)) fs.mkdirSync(ORGS_DIR, { recursive: true });
}

// ============================================================
// System DB (singleton)
// ============================================================
export type SystemDb = ReturnType<typeof drizzle<typeof systemSchema>>;

let _systemDb: SystemDb | null = null;

export function getSystemDb(): SystemDb {
	if (!_systemDb) {
		ensureDirs();
		const dbPath = path.join(DB_DIR, 'system.db');
		const sqlite = new Database(dbPath);
		sqlite.pragma('journal_mode = WAL');
		sqlite.pragma('foreign_keys = ON');
		_systemDb = drizzle(sqlite, { schema: systemSchema });
	}
	return _systemDb;
}

// ============================================================
// Org DB pool (cached)
// ============================================================
export type OrgDb = ReturnType<typeof drizzle<typeof orgSchema>>;

const orgDbPool = new Map<string, OrgDb>();

export function getOrgDb(slug: string): OrgDb {
	const cached = orgDbPool.get(slug);
	if (cached) return cached;

	ensureDirs();
	const dbPath = path.join(ORGS_DIR, `${slug}.db`);
	if (!fs.existsSync(dbPath)) {
		throw new Error(`Organization database not found: ${slug}`);
	}

	const sqlite = new Database(dbPath);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');

	// Migration: ensure org_settings table exists
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS org_settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL,
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);
		INSERT OR IGNORE INTO org_settings (key, value) VALUES ('enforce_status_transitions', 'true');
		INSERT OR IGNORE INTO org_settings (key, value) VALUES ('custom_roles', '${JSON.stringify(DEFAULT_CUSTOM_ROLES)}');
	`);

	// Migration: ensure participant_views table exists
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS participant_views (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			filters TEXT NOT NULL DEFAULT '{}',
			position INTEGER NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);
	`);

	// Migration: certificate_templates table + certificates.template_id
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS certificate_templates (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			original_filename TEXT,
			created_by TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);
	`);
	try {
		sqlite.exec(`ALTER TABLE certificates ADD COLUMN template_id TEXT REFERENCES certificate_templates(id)`);
	} catch {
		// Column already exists
	}

	// Migration: certificates.validation_code column
	try {
		sqlite.exec(`ALTER TABLE certificates ADD COLUMN validation_code TEXT`);
	} catch {
		// Column already exists
	}

	// Migration: certificate_fonts table
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS certificate_fonts (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			original_filename TEXT,
			created_by TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);
	`);

	// Migration: dynamic forms
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS forms (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			slug TEXT NOT NULL UNIQUE,
			description TEXT,
			is_active INTEGER NOT NULL DEFAULT 1,
			is_public INTEGER NOT NULL DEFAULT 0,
			requires_auth INTEGER NOT NULL DEFAULT 0,
			public_token TEXT UNIQUE,
			author_id TEXT,
			author_name TEXT,
			author_role TEXT,
			definition TEXT NOT NULL DEFAULT '{}',
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);
	`);
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS form_responses (
			id TEXT PRIMARY KEY,
			form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
			submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
			participant_id TEXT REFERENCES participants(id) ON DELETE SET NULL,
			submitter_id TEXT,
			submitter_name TEXT,
			submitter_email TEXT,
			source_ip TEXT,
			source_user_agent TEXT,
			answers TEXT NOT NULL DEFAULT '{}',
			metadata TEXT NOT NULL DEFAULT '{}'
		);
	`);
	try {
		sqlite.exec(`ALTER TABLE form_responses ADD COLUMN participant_id TEXT REFERENCES participants(id) ON DELETE SET NULL`);
	} catch {
		// Column already exists
	}

	const db = drizzle(sqlite, { schema: orgSchema });
	orgDbPool.set(slug, db);
	return db;
}

// ============================================================
// Create new org DB (with schema applied)
// ============================================================
export function createOrgDb(slug: string): OrgDb {
	ensureDirs();
	const dbPath = path.join(ORGS_DIR, `${slug}.db`);
	if (fs.existsSync(dbPath)) {
		throw new Error(`Organization database already exists: ${slug}`);
	}

	const sqlite = new Database(dbPath);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');

	// Create tables
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS participants (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT NOT NULL,
			role TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'inscrito',
			enrollment_date TEXT,
			cycle_end_date TEXT,
			workload_hours INTEGER,
			notes TEXT,
			is_active INTEGER NOT NULL DEFAULT 1,
			deleted_at TEXT,
			deleted_by TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS status_history (
			id TEXT PRIMARY KEY,
			participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
			from_status TEXT,
			to_status TEXT NOT NULL,
			changed_at TEXT NOT NULL DEFAULT (datetime('now')),
			changed_by TEXT
		);

		CREATE TABLE IF NOT EXISTS certificate_templates (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			original_filename TEXT,
			created_by TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS certificate_fonts (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			original_filename TEXT,
			created_by TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS certificates (
			id TEXT PRIMARY KEY,
			participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
			template_id TEXT REFERENCES certificate_templates(id),
			workload_hours INTEGER,
			period_start TEXT,
			period_end TEXT,
			pdf_path TEXT,
			sent_at TEXT,
			sent_to_email TEXT,
			validation_code TEXT,
			status TEXT NOT NULL DEFAULT 'gerado',
			is_active INTEGER NOT NULL DEFAULT 1,
			deleted_at TEXT,
			deleted_by TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS workgroups (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			description TEXT,
			is_active INTEGER NOT NULL DEFAULT 1,
			deleted_at TEXT,
			deleted_by TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS user_workgroups (
			user_id TEXT NOT NULL,
			workgroup_id TEXT NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
			PRIMARY KEY (user_id, workgroup_id)
		);

		CREATE TABLE IF NOT EXISTS org_settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL,
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS participant_views (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			filters TEXT NOT NULL DEFAULT '{}',
			position INTEGER NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		INSERT OR IGNORE INTO org_settings (key, value) VALUES ('enforce_status_transitions', 'true');
		INSERT OR IGNORE INTO org_settings (key, value) VALUES ('custom_roles', '${JSON.stringify(DEFAULT_CUSTOM_ROLES)}');
	`);

	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS forms (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			slug TEXT NOT NULL UNIQUE,
			description TEXT,
			is_active INTEGER NOT NULL DEFAULT 1,
			is_public INTEGER NOT NULL DEFAULT 0,
			requires_auth INTEGER NOT NULL DEFAULT 0,
			public_token TEXT UNIQUE,
			author_id TEXT,
			author_name TEXT,
			author_role TEXT,
			definition TEXT NOT NULL DEFAULT '{}',
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);
	`);
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS form_responses (
			id TEXT PRIMARY KEY,
			form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
			submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
			participant_id TEXT REFERENCES participants(id) ON DELETE SET NULL,
			submitter_id TEXT,
			submitter_name TEXT,
			submitter_email TEXT,
			source_ip TEXT,
			source_user_agent TEXT,
			answers TEXT NOT NULL DEFAULT '{}',
			metadata TEXT NOT NULL DEFAULT '{}'
		);
	`);

	const db = drizzle(sqlite, { schema: orgSchema });
	orgDbPool.set(slug, db);
	return db;
}

// ============================================================
// Initialize system DB tables
// ============================================================
export function initSystemDb(): void {
	const db = getSystemDb();
	const sqlite = (db as unknown as { session: { client: Database.Database } }).session.client;

	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS organizations (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			slug TEXT NOT NULL UNIQUE,
			brand_name TEXT,
			logo_url TEXT,
			primary_color TEXT DEFAULT '#324acb',
			is_active INTEGER NOT NULL DEFAULT 1,
			deleted_at TEXT,
			deleted_by TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			name TEXT NOT NULL,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL CHECK(role IN ('sysadmin', 'admin', 'volunteer', 'mentee', 'dumb')),
			organization_id TEXT REFERENCES organizations(id),
			is_active INTEGER NOT NULL DEFAULT 1,
			last_login_at TEXT,
			deleted_at TEXT,
			deleted_by TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id),
			expires_at TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS invitations (
			id TEXT PRIMARY KEY,
			token TEXT NOT NULL UNIQUE,
			email TEXT NOT NULL,
			role TEXT NOT NULL CHECK(role IN ('admin', 'volunteer', 'mentee', 'dumb')),
			organization_id TEXT NOT NULL REFERENCES organizations(id),
			invited_by TEXT NOT NULL REFERENCES users(id),
			expires_at TEXT NOT NULL,
			accepted_at TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS api_keys (
			id TEXT PRIMARY KEY,
			owner_type TEXT NOT NULL CHECK(owner_type IN ('user', 'organization')),
			owner_id TEXT NOT NULL,
			service TEXT NOT NULL DEFAULT 'resend',
			encrypted_key TEXT NOT NULL,
			iv TEXT NOT NULL,
			salt TEXT NOT NULL,
			hash_digest TEXT NOT NULL,
			label TEXT,
			is_active INTEGER NOT NULL DEFAULT 1,
			deleted_at TEXT,
			deleted_by TEXT,
			anonymized_at TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			updated_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS audit_log (
			id TEXT PRIMARY KEY,
			who TEXT NOT NULL REFERENCES users(id),
			what_table TEXT NOT NULL,
			what_record_id TEXT,
			how TEXT NOT NULL CHECK(how IN ('CREATE', 'READ', 'UPDATE', 'DELETE')),
			why TEXT NOT NULL,
			"when" TEXT NOT NULL DEFAULT (datetime('now')),
			where_ip TEXT,
			how_many_affected INTEGER DEFAULT 1,
			organization_id TEXT,
			where_organization TEXT,
			hash_digest TEXT NOT NULL
		);

		CREATE INDEX IF NOT EXISTS audit_log_who_idx ON audit_log(who);
		CREATE INDEX IF NOT EXISTS audit_log_where_ip_idx ON audit_log(where_ip);
		CREATE INDEX IF NOT EXISTS audit_log_when_idx ON audit_log("when");
		CREATE INDEX IF NOT EXISTS audit_log_org_when_idx ON audit_log(organization_id, "when");
	`);

	// Migration: add where_organization column if missing
	try {
		sqlite.exec(`ALTER TABLE audit_log ADD COLUMN where_organization TEXT`);
	} catch {
		// Column already exists
	}
}
