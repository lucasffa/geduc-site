import {
	pgTable,
	serial,
	integer,
	varchar,
	text,
	timestamp,
	date
} from 'drizzle-orm/pg-core';

// Tabela original (mantida)
export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	age: integer('age')
});

// Participantes (mentorados, voluntários, equipe)
export const participants = pgTable('participants', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	role: varchar('role', { length: 100 }).notNull(),
	status: varchar('status', { length: 50 }).notNull().default('inscrito'),
	enrollmentDate: date('enrollment_date'),
	cycleEndDate: date('cycle_end_date'),
	workloadHours: integer('workload_hours'),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Histórico de transições de status
export const statusHistory = pgTable('status_history', {
	id: serial('id').primaryKey(),
	participantId: integer('participant_id')
		.references(() => participants.id, { onDelete: 'cascade' })
		.notNull(),
	fromStatus: varchar('from_status', { length: 50 }),
	toStatus: varchar('to_status', { length: 50 }).notNull(),
	changedAt: timestamp('changed_at').defaultNow().notNull(),
	changedBy: varchar('changed_by', { length: 255 })
});

// Certificados emitidos
export const certificates = pgTable('certificates', {
	id: serial('id').primaryKey(),
	participantId: integer('participant_id')
		.references(() => participants.id, { onDelete: 'cascade' })
		.notNull(),
	templateName: varchar('template_name', { length: 255 }),
	workloadHours: integer('workload_hours'),
	periodStart: date('period_start'),
	periodEnd: date('period_end'),
	pdfPath: text('pdf_path'),
	sentAt: timestamp('sent_at'),
	sentToEmail: varchar('sent_to_email', { length: 255 }),
	status: varchar('status', { length: 50 }).notNull().default('gerado'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
