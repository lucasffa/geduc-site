#!/usr/bin/env node
/**
 * Script para criar o database de uma organização existente
 * Uso: tsx scripts/create-org-db.ts <org-slug>
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const slug: string | undefined = process.argv[2];

if (!slug) {
	console.error('❌ Uso: tsx scripts/create-org-db.ts <org-slug>');
	console.error('Exemplo: tsx scripts/create-org-db.ts geduc');
	process.exit(1);
}

const DB_DIR: string = process.env.DB_DIR || path.join(projectRoot, 'data');
const ORGS_DIR: string = path.join(DB_DIR, 'orgs');
const dbPath: string = path.join(ORGS_DIR, `${slug}.db`);

console.log(`📁 Criando database para organização: ${slug}`);
console.log(`📍 Caminho: ${dbPath}`);

// Ensure directories exist
if (!fs.existsSync(ORGS_DIR)) {
	fs.mkdirSync(ORGS_DIR, { recursive: true });
	console.log(`✅ Diretório criado: ${ORGS_DIR}`);
}

// Check if already exists
if (fs.existsSync(dbPath)) {
	console.log(`⚠️  Database já existe: ${dbPath}`);
	process.exit(0);
}

try {
	const sqlite = new Database(dbPath);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');

	console.log(`✅ Arquivo de database criado`);

	// Create all tables in a single block
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

		CREATE TABLE IF NOT EXISTS user_workgroups (
			user_id TEXT NOT NULL,
			workgroup_id TEXT NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
			PRIMARY KEY (user_id, workgroup_id)
		);

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
	console.log(\`✅ Todas as tabelas criadas\`);

	sqlite.close();
	console.log(`\n✅ Database criado com sucesso para organização: ${slug}`);
	console.log(`📍 Arquivo: ${dbPath}`);
} catch (error) {
	const errorMessage = error instanceof Error ? error.message : String(error);
	console.error(`\n❌ Erro ao criar database:`, errorMessage);
	process.exit(1);
}
