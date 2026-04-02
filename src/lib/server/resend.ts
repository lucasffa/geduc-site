import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { cache, CacheKeys } from '$lib/server/cache';

/**
 * Tri-mode Resend client:
 * 1. System key (env RESEND_API_KEY) — for invitations, auth emails
 * 2. User key (cached after login) — per-user Resend key
 * 3. Org key (cached after admin login) — organization-wide Resend key
 *
 * Priority for certificate sending: user key > org key > system key
 */

/** System-level Resend client from env var */
export function getSystemResendClient(): Resend {
	// Em alguns ambientes de execução (Docker/CI/host) o env pode vir de process.env.
	// `@sveltejs/kit` usa `env` dinâmico, mas manter fallback torna o debug mais fácil.
	const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
	if (!apiKey) {
		throw new Error('RESEND_API_KEY is not set; verifique .env, variável de ambiente e restart do processo');
	}
	return new Resend(apiKey);
}

/**
 * Get best available Resend client for invitations and certificate sending.
 * Priority: user key > org key > system key
 */
export function getResendClient(userId?: string, orgId?: string): Resend {
	if (userId) {
		const userClient = getUserResendClient(userId);
		if (userClient) return userClient;
	}
	if (orgId) {
		const orgClient = getOrgResendClient(orgId);
		if (orgClient) return orgClient;
	}
	return getSystemResendClient();
}

/** User-level Resend client from cache (decrypted at login, TTL=0) */
export function getUserResendClient(userId: string): Resend | null {
	const key = cache.get<string>(CacheKeys.apiKeyUser(userId));
	if (!key) return null;
	return new Resend(key);
}

/** Organization-level Resend client from cache (decrypted by admin at login, TTL=0) */
export function getOrgResendClient(orgId: string): Resend | null {
	const key = cache.get<string>(CacheKeys.apiKeyOrg(orgId));
	if (!key) return null;
	return new Resend(key);
}

/**
 * Get best available Resend client for certificate sending.
 * Priority: user key > org key > system key
 */
export function getResendClientForCertificates(userId: string, orgId?: string): Resend {
	const userClient = getUserResendClient(userId);
	if (userClient) return userClient;

	if (orgId) {
		const orgClient = getOrgResendClient(orgId);
		if (orgClient) return orgClient;
	}

	return getSystemResendClient();
}

export async function sendCertificateEmail(
	to: string,
	participantName: string,
	pdfBuffer: Uint8Array,
	filename: string,
	userId: string,
	orgId?: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResendClient(userId, orgId);
		const fromEmail = env.RESEND_FROM_EMAIL || 'certificados@geduc.org';

		await resend.emails.send({
			from: fromEmail,
			to,
			subject: `Seu certificado GEDUC - ${participantName}`,
			html: `
				<div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
					<h1 style="color: #152db5; font-size: 24px; margin-bottom: 16px;">Certificado GEDUC</h1>
					<p style="color: #2a2a2a; font-size: 16px; line-height: 1.6;">
						Olá, <strong>${participantName}</strong>!
					</p>
					<p style="color: #2a2a2a; font-size: 16px; line-height: 1.6;">
						Segue em anexo o seu certificado de participação no programa GEDUC.
					</p>
					<p style="color: #2a2a2a; font-size: 16px; line-height: 1.6;">
						Obrigado pela sua dedicação e contribuição!
					</p>
					<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
					<p style="color: #757575; font-size: 12px;">
						Este é um e-mail automático do sistema GEDUC. Não responda a este e-mail.
					</p>
				</div>
			`,
			attachments: [
				{
					filename,
					content: Buffer.from(pdfBuffer)
				}
			]
		});

		return { success: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Erro desconhecido';
		console.error('Erro ao enviar e-mail:', message);
		return { success: false, error: message };
	}
}

export async function sendInviteEmail(
	to: string,
	inviteLink: string,
	role: string,
	userId?: string,
	orgId?: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResendClient(userId, orgId);
		const fromEmail = env.RESEND_FROM_EMAIL || 'contato@geduc.org';

		await resend.emails.send({
			from: fromEmail,
			to,
			subject: `Convite GEDUC para ${role}`,
			html: `
				<div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
					<h1 style="color: #152db5; font-size: 24px; margin-bottom: 16px;">Você foi convidado para o GEDUC</h1>
					<p style="color: #2a2a2a; font-size: 16px; line-height: 1.6;">Olá,</p>
					<p style="color: #2a2a2a; font-size: 16px; line-height: 1.6;">
						Você foi convidado para entrar no GEDUC com a função <strong>${role}</strong>.
					</p>
					<p style="margin: 24px 0;">
						<a href="${inviteLink}" style="display: inline-block; padding: 12px 20px; background: #152db5; color: white; text-decoration: none; border-radius: 5px;">Aceitar Convite</a>
					</p>
					<p style="color: #2a2a2a; font-size: 14px;">Caso o botão não funcione, copie e cole o link abaixo no navegador:</p>
					<p style="color:#0943ba;font-size:14px;word-wrap:break-word;">${inviteLink}</p>
					<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0;" />
					<p style="color: #757575; font-size: 12px;">Este é um e-mail automático do sistema GEDUC. Não responda a este e-mail.</p>
				</div>
			`
		});

		return { success: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Erro desconhecido';
		console.error('Erro ao enviar e-mail de convite:', message);
		return { success: false, error: message };
	}
}

export async function sendTestEmail(
	testEmail: string,
	participantName: string,
	pdfBuffer: Uint8Array,
	filename: string,
	userId: string,
	orgId?: string
): Promise<{ success: boolean; error?: string }> {
	return sendCertificateEmail(testEmail, participantName, pdfBuffer, filename, userId, orgId);
}
