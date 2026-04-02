import type { PageServerLoad } from './$types';
import { getSystemDb, getOrgDb } from '$lib/server/db';
import { organizations } from '$lib/server/db/schema-system';
import { certificates, participants } from '$lib/server/db/schema-org';
import { eq, isNull, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const code = url.searchParams.get('code')?.trim();
	if (!code) return { result: null, code: null };

	const systemDb = getSystemDb();
	const orgs = systemDb
		.select({ slug: organizations.slug, name: organizations.name })
		.from(organizations)
		.where(isNull(organizations.deletedAt))
		.all();

	for (const org of orgs) {
		let orgDb;
		try {
			orgDb = getOrgDb(org.slug);
		} catch {
			continue;
		}

		const cert = orgDb
			.select({
				id: certificates.id,
				participantId: certificates.participantId,
				workloadHours: certificates.workloadHours,
				periodStart: certificates.periodStart,
				periodEnd: certificates.periodEnd,
				status: certificates.status,
				createdAt: certificates.createdAt,
				validationCode: certificates.validationCode
			})
			.from(certificates)
			.where(and(
				eq(certificates.validationCode, code),
				isNull(certificates.deletedAt)
			))
			.get();

		if (cert) {
			const participant = orgDb
				.select({ name: participants.name, role: participants.role })
				.from(participants)
				.where(eq(participants.id, cert.participantId))
				.get();

			return {
				code,
				result: {
					valid: true,
					participantName: participant?.name ?? 'N/A',
					role: participant?.role ?? 'N/A',
					workloadHours: cert.workloadHours,
					periodStart: cert.periodStart,
					periodEnd: cert.periodEnd,
					issuedAt: cert.createdAt,
					organization: org.name
				}
			};
		}
	}

	return { code, result: { valid: false } };
};
