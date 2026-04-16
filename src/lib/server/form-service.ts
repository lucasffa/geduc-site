// src/lib/server/form-service.ts
import { randomUUID } from 'node:crypto';
import { eq, ne, sql, desc } from 'drizzle-orm';
import type { OrgDb } from '$lib/server/db';
import { forms, formResponses } from '$lib/server/db/schema-org';
import type {
	CreateFormInput,
	FormRecord,
	FormResponseRecord,
	FormResponseData,
	FormDefinition,
	SubmitFormResponseInput,
	UpdateFormInput
} from '$lib/types/forms';

function normalizeSlug(value: string): string {
	return (
		value
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '') || randomUUID().slice(0, 8)
	);
}

function generatePublicToken(): string {
	return randomUUID();
}

// FIX: accepts optional `excludeId` so an existing form's own slug doesn't
// trigger a false collision during updates.
function createFormSlug(db: OrgDb, baseSlug: string, excludeId?: string): string {
	let slug = normalizeSlug(baseSlug);
	let counter = 1;

	const isSlugTaken = (candidate: string) => {
		const query = db.select().from(forms).where(eq(forms.slug, candidate));
		if (excludeId) {
			// exclude the row being updated from the collision check
			return db
				.select()
				.from(forms)
				.where(eq(forms.slug, candidate))
				.all()
				.filter((r: any) => r.id !== excludeId).length > 0;
		}
		return !!query.get();
	};

	while (isSlugTaken(slug)) {
		slug = `${normalizeSlug(baseSlug)}-${counter++}`;
	}
	return slug;
}

function createPublicToken(db: OrgDb): string {
	let token = generatePublicToken();
	while (db.select().from(forms).where(eq(forms.publicToken, token)).get()) {
		token = generatePublicToken();
	}
	return token;
}

function serializeDefinition(definition: FormDefinition): string {
	return JSON.stringify(definition);
}

function deserializeDefinition(definitionText: string): FormDefinition {
	try {
		return JSON.parse(definitionText) as FormDefinition;
	} catch {
		return { fields: [] };
	}
}

function mapFormRow(row: any): FormRecord {
	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		description: row.description,
		isPublic: Boolean(row.isPublic ?? row.is_public),
		requiresAuth: Boolean(row.requiresAuth ?? row.requires_auth),
		isActive: Boolean(row.isActive ?? row.is_active),
		publicToken: row.publicToken ?? row.public_token,
		authorId: row.authorId ?? row.author_id,
		authorName: row.authorName ?? row.author_name,
		authorRole: row.authorRole ?? row.author_role,
		definition: deserializeDefinition(row.definition),
		createdAt: row.createdAt ?? row.created_at,
		updatedAt: row.updatedAt ?? row.updated_at
	};
}

function mapFormResponseRow(row: any): FormResponseRecord {
	return {
		id: row.id,
		formId: row.formId ?? row.form_id,
		submittedAt: row.submittedAt ?? row.submitted_at,
		answers: JSON.parse(row.answers ?? '{}'),
		submitterId: row.submitterId ?? row.submitter_id,
		submitterName: row.submitterName ?? row.submitter_name,
		submitterEmail: row.submitterEmail ?? row.submitter_email,
		sourceIp: row.sourceIp ?? row.source_ip,
		sourceUserAgent: row.sourceUserAgent ?? row.source_user_agent,
		metadata: JSON.parse(row.metadata ?? '{}')
	};
}

export function listForms(db: OrgDb): FormRecord[] {
	console.log('[form-service] listForms: iniciando listagem de formulários');
	try {
		const results = db
			.select()
			.from(forms)
			.orderBy(desc(forms.createdAt))
			.all()
			.map(mapFormRow);
		console.log(`[form-service] listForms: ${results.length} formulários encontrados`);
		return results;
	} catch (error) {
		console.error('[form-service] listForms: ERRO ao listar formulários', error);
		throw error;
	}
}

// Returns each FormRecord enriched with the number of submitted responses.
export function listFormsWithResponseCount(
	db: OrgDb
): (FormRecord & { responseCount: number })[] {
	const allForms = listForms(db);

	const counts: Record<string, number> = {};
	db.select()
		.from(formResponses)
		.all()
		.forEach((r: any) => {
			const fid = r.formId ?? r.form_id;
			counts[fid] = (counts[fid] ?? 0) + 1;
		});

	return allForms.map((f) => ({ ...f, responseCount: counts[f.id] ?? 0 }));
}

export function getFormById(db: OrgDb, id: string): FormRecord | null {
	console.log(`[form-service] getFormById: buscando formulário com id=${id}`);
	try {
		const row = db.select().from(forms).where(eq(forms.id, id)).get();
		if (row) {
			console.log(`[form-service] getFormById: formulário encontrado - ${row.title}`);
			return mapFormRow(row);
		}
		console.log(`[form-service] getFormById: formulário não encontrado`);
		return null;
	} catch (error) {
		console.error(`[form-service] getFormById: ERRO ao buscar formulário id=${id}`, error);
		throw error;
	}
}

export function getFormBySlug(db: OrgDb, slug: string): FormRecord | null {
	console.log(`[form-service] getFormBySlug: buscando formulário com slug=${slug}`);
	try {
		const row = db.select().from(forms).where(eq(forms.slug, slug)).get();
		if (row) {
			console.log(`[form-service] getFormBySlug: formulário encontrado - ${row.title}`);
			return mapFormRow(row);
		}
		console.log(`[form-service] getFormBySlug: formulário não encontrado para slug=${slug}`);
		return null;
	} catch (error) {
		console.error(`[form-service] getFormBySlug: ERRO ao buscar slug=${slug}`, error);
		throw error;
	}
}

export function getFormByPublicToken(db: OrgDb, publicToken: string): FormRecord | null {
	const row = db.select().from(forms).where(eq(forms.publicToken, publicToken)).get();
	return row ? mapFormRow(row) : null;
}

export function createForm(db: OrgDb, input: CreateFormInput): FormRecord {
	console.log(`[form-service] createForm: criando novo formulário - title=${input.title}`);
	try {
		const id = randomUUID();
		console.log(`[form-service] createForm: id gerado=${id}`);
		const slug = createFormSlug(db, input.slug ?? input.title);
		console.log(`[form-service] createForm: slug gerado=${slug}`);
		const publicToken =
			input.isPublic ? (input.publicToken ?? createPublicToken(db)) : undefined;
		if (input.isPublic) {
			console.log(`[form-service] createForm: formulário público com token=${publicToken?.slice(0, 8)}...`);
		}
		const now = new Date().toISOString();

		db.insert(forms)
			.values({
				id,
				title: input.title,
				slug,
				description: input.description,
				isActive: input.isActive ?? true,
				isPublic: input.isPublic ?? false,
				requiresAuth: input.requiresAuth ?? false,
				publicToken,
				authorId: input.authorId,
				authorName: input.authorName,
				authorRole: input.authorRole,
				definition: serializeDefinition(input.definition),
				createdAt: now,
				updatedAt: now
			})
			.run();

		console.log(`[form-service] createForm: sucesso - formulário criado id=${id}`);
		return {
			id,
			title: input.title,
			slug,
			description: input.description,
			isActive: input.isActive ?? true,
			isPublic: input.isPublic ?? false,
			requiresAuth: input.requiresAuth ?? false,
			publicToken,
			authorId: input.authorId,
			authorName: input.authorName,
			authorRole: input.authorRole,
			definition: input.definition,
			createdAt: now,
			updatedAt: now
		};
	} catch (error) {
		console.error(`[form-service] createForm: ERRO ao criar formulário`, error);
		throw error;
	}
}

export function updateForm(db: OrgDb, id: string, input: UpdateFormInput): FormRecord | null {
	const existing = getFormById(db, id);
	if (!existing) return null;

	// FIX: pass `id` as excludeId so the form's own slug is not flagged as a collision
	const slug = input.slug ? createFormSlug(db, input.slug, id) : existing.slug;

	// Simplified public-token logic:
	// - Explicitly setting isPublic=false  → clear token
	// - Otherwise keep or generate a token when public
	let publicToken: string | undefined;
	if (input.isPublic === false) {
		publicToken = undefined;
	} else if (input.isPublic === true) {
		publicToken = existing.publicToken ?? createPublicToken(db);
	} else {
		// isPublic unchanged — keep whatever the existing state dictates
		publicToken = existing.isPublic ? existing.publicToken : undefined;
	}

	const now = new Date().toISOString();

	db.update(forms)
		.set({
			title: input.title ?? existing.title,
			slug,
			description: input.description ?? existing.description,
			isActive: input.isActive ?? existing.isActive,
			isPublic: input.isPublic ?? existing.isPublic,
			requiresAuth: input.requiresAuth ?? existing.requiresAuth,
			publicToken,
			authorId: input.authorId ?? existing.authorId,
			authorName: input.authorName ?? existing.authorName,
			authorRole: input.authorRole ?? existing.authorRole,
			definition: serializeDefinition(input.definition ?? existing.definition),
			updatedAt: now
		})
		.where(eq(forms.id, id))
		.run();

	return {
		...existing,
		...input,
		slug,
		publicToken,
		updatedAt: now,
		definition: input.definition ?? existing.definition
	};
}

export function deleteForm(db: OrgDb, id: string): boolean {
	const existing = getFormById(db, id);
	if (!existing) return false;

	// Cascade-delete all responses first (SQLite may not enforce FK cascades)
	db.delete(formResponses).where(eq(formResponses.formId, id)).run();
	db.delete(forms).where(eq(forms.id, id)).run();
	return true;
}

export function duplicateForm(db: OrgDb, id: string, authorId?: string, authorName?: string): FormRecord | null {
	const existing = getFormById(db, id);
	if (!existing) return null;

	return createForm(db, {
		title: `${existing.title} (cópia)`,
		description: existing.description,
		isPublic: false, // duplicates start as private
		requiresAuth: existing.requiresAuth,
		isActive: existing.isActive,
		definition: existing.definition,
		authorId: authorId ?? existing.authorId,
		authorName: authorName ?? existing.authorName,
		authorRole: existing.authorRole
	});
}

export function listFormResponses(db: OrgDb, formId: string): FormResponseRecord[] {
	return db
		.select()
		.from(formResponses)
		.where(eq(formResponses.formId, formId))
		.orderBy(formResponses.submittedAt.desc())
		.all()
		.map(mapFormResponseRow);
}

export function getFormResponseById(db: OrgDb, id: string): FormResponseRecord | null {
	const row = db.select().from(formResponses).where(eq(formResponses.id, id)).get();
	return row ? mapFormResponseRow(row) : null;
}

export function submitFormResponse(
	db: OrgDb,
	input: SubmitFormResponseInput
): FormResponseRecord {
	const id = randomUUID();
	const submittedAt = new Date().toISOString();

	db.insert(formResponses)
		.values({
			id,
			formId: input.formId,
			submitterId: input.submitterId,
			submitterName: input.submitterName,
			submitterEmail: input.submitterEmail,
			sourceIp: input.sourceIp,
			sourceUserAgent: input.sourceUserAgent,
			answers: JSON.stringify(input.answers),
			metadata: JSON.stringify(input.metadata ?? {}),
			submittedAt
		})
		.run();

	return {
		id,
		formId: input.formId,
		submittedAt,
		answers: input.answers,
		submitterId: input.submitterId,
		submitterName: input.submitterName,
		submitterEmail: input.submitterEmail,
		sourceIp: input.sourceIp,
		sourceUserAgent: input.sourceUserAgent,
		metadata: input.metadata ?? {}
	};
}