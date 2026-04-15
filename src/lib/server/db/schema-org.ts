import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================================
// PARTICIPANTS
// ============================================================
export const participants = sqliteTable('participants', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	role: text('role').notNull(),
	status: text('status').notNull().default('inscrito'),
	enrollmentDate: text('enrollment_date'),
	cycleEndDate: text('cycle_end_date'),
	workloadHours: integer('workload_hours'),
	notes: text('notes'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by'),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
	updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// STATUS HISTORY
// ============================================================
export const statusHistory = sqliteTable('status_history', {
	id: text('id').primaryKey(),
	participantId: text('participant_id')
		.notNull()
		.references(() => participants.id, { onDelete: 'cascade' }),
	fromStatus: text('from_status'),
	toStatus: text('to_status').notNull(),
	changedAt: text('changed_at').notNull().default(sql`(datetime('now'))`),
	changedBy: text('changed_by')
});

// ============================================================
// CERTIFICATE TEMPLATES
// ============================================================
export const certificateTemplates = sqliteTable('certificate_templates', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	originalFilename: text('original_filename'),
	createdBy: text('created_by'),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// CERTIFICATE FONTS
// ============================================================
export const certificateFonts = sqliteTable('certificate_fonts', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	originalFilename: text('original_filename'),
	createdBy: text('created_by'),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// CERTIFICATES
// ============================================================
export const certificates = sqliteTable('certificates', {
	id: text('id').primaryKey(),
	participantId: text('participant_id')
		.notNull()
		.references(() => participants.id, { onDelete: 'cascade' }),
	templateId: text('template_id')
		.references(() => certificateTemplates.id),
	workloadHours: integer('workload_hours'),
	periodStart: text('period_start'),
	periodEnd: text('period_end'),
	pdfPath: text('pdf_path'),
	sentAt: text('sent_at'),
	sentToEmail: text('sent_to_email'),
	validationCode: text('validation_code'),
	status: text('status').notNull().default('gerado'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by'),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// WORKGROUPS
// ============================================================
export const workgroups = sqliteTable('workgroups', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by'),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
	updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// ORG SETTINGS
// ============================================================
export const orgSettings = sqliteTable('org_settings', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// PARTICIPANT VIEWS
// ============================================================
export const participantViews = sqliteTable('participant_views', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	filters: text('filters').notNull().default('{}'),
	position: integer('position').notNull().default(0),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
	updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// USER <-> WORKGROUP (junction)
// ============================================================
export const userWorkgroups = sqliteTable(
	'user_workgroups',
	{
		userId: text('user_id').notNull(),
		workgroupId: text('workgroup_id')
			.notNull()
			.references(() => workgroups.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.userId, table.workgroupId] })]
);

// ============================================================
// FORMS
// ============================================================
export const forms = sqliteTable('forms', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
	requiresAuth: integer('requires_auth', { mode: 'boolean' }).notNull().default(false),
	publicToken: text('public_token').unique(),
	authorId: text('author_id'),
	authorName: text('author_name'),
	authorRole: text('author_role'),
	definition: text('definition').notNull().default('{}'),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
	updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`)
});

// ============================================================
// FORM RESPONSES
// ============================================================
export const formResponses = sqliteTable('form_responses', {
	id: text('id').primaryKey(),
	formId: text('form_id')
		.notNull()
		.references(() => forms.id, { onDelete: 'cascade' }),
	submittedAt: text('submitted_at').notNull().default(sql`(datetime('now'))`),
	submitterId: text('submitter_id'),
	submitterName: text('submitter_name'),
	submitterEmail: text('submitter_email'),
	sourceIp: text('source_ip'),
	sourceUserAgent: text('source_user_agent'),
	answers: text('answers').notNull().default('{}'),
	metadata: text('metadata').notNull().default('{}')
});
