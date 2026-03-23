import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================================
// ORGANIZATIONS
// ============================================================
export const organizations = sqliteTable('organizations', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	brandName: text('brand_name'),
	logoUrl: text('logo_url'),
	primaryColor: text('primary_color').default('#324acb'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by'),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
	updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// USERS
// ============================================================
export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	passwordHash: text('password_hash').notNull(),
	role: text('role', {
		enum: ['sysadmin', 'admin', 'volunteer', 'mentee', 'dumb']
	}).notNull(),
	organizationId: text('organization_id').references(() => organizations.id),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	lastLoginAt: text('last_login_at'),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by'),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
	updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// SESSIONS
// ============================================================
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: text('expires_at').notNull(),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// INVITATIONS
// ============================================================
export const invitations = sqliteTable('invitations', {
	id: text('id').primaryKey(),
	token: text('token').notNull().unique(),
	email: text('email').notNull(),
	role: text('role', {
		enum: ['admin', 'volunteer', 'mentee', 'dumb']
	}).notNull(),
	organizationId: text('organization_id')
		.notNull()
		.references(() => organizations.id),
	invitedBy: text('invited_by')
		.notNull()
		.references(() => users.id),
	expiresAt: text('expires_at').notNull(),
	acceptedAt: text('accepted_at'),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// API KEYS (Resend keys, etc.)
// ============================================================
export const apiKeys = sqliteTable('api_keys', {
	id: text('id').primaryKey(),
	ownerType: text('owner_type', { enum: ['user', 'organization'] }).notNull(),
	ownerId: text('owner_id').notNull(),
	service: text('service').notNull().default('resend'),
	encryptedKey: text('encrypted_key').notNull(),
	iv: text('iv').notNull(),
	salt: text('salt').notNull(),
	hashDigest: text('hash_digest').notNull(),
	label: text('label'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by'),
	anonymizedAt: text('anonymized_at'),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
	updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// AUDIT LOG (6W2H)
// WHO, WHAT, HOW, WHY, WHEN, WHERE (IP), WHERE (Org), HOW MANY
// ============================================================
export const auditLog = sqliteTable(
	'audit_log',
	{
		id: text('id').primaryKey(),
		who: text('who')
			.notNull()
			.references(() => users.id),
		whatTable: text('what_table').notNull(),
		whatRecordId: text('what_record_id'),
		how: text('how', { enum: ['CREATE', 'READ', 'UPDATE', 'DELETE'] }).notNull(),
		why: text('why').notNull(),
		when: text('when').notNull().default(sql`(datetime('now'))`),
		whereIp: text('where_ip'),
		howManyAffected: integer('how_many_affected').default(1),
		organizationId: text('organization_id'),
		whereOrganization: text('where_organization'),
		hashDigest: text('hash_digest').notNull()
	},
	(table) => [
		index('audit_log_who_idx').on(table.who),
		index('audit_log_where_ip_idx').on(table.whereIp),
		index('audit_log_when_idx').on(table.when),
		index('audit_log_org_when_idx').on(table.organizationId, table.when)
	]
);
