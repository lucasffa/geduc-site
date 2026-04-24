import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { cache, CacheKeys } from '$lib/server/cache';
import { orgSettings } from '$lib/server/db/schema-org';
import { eq } from 'drizzle-orm';
import type { OrgDb } from '$lib/server/db';

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

export interface OrgEmailConfig {
	/** Nome da organização (ex: "GEDUC") */
	orgName: string;
	/** Domínio de email configurado (ex: "geduc.org") */
	emailDomain?: string;
	/** Endereço de email remetente completo (sobrescreve o padrão contato@domain) */
	emailFrom?: string;
	/** Cor primária da organização para o template */
	primaryColor?: string;
}

/**
 * Lê a config de email da organização a partir do orgSettings e dados da org.
 */
export function getOrgEmailConfig(
	orgDb: OrgDb,
	orgName: string,
	primaryColor?: string
): OrgEmailConfig {
	const rows = orgDb.select().from(orgSettings).all();
	const settings: Record<string, string> = {};
	for (const row of rows) {
		settings[row.key] = row.value;
	}

	return {
		orgName,
		emailDomain: settings['email_domain'] || undefined,
		emailFrom: settings['email_from'] || undefined,
		primaryColor: primaryColor || undefined
	};
}

/**
 * Resolve o endereço de email remetente baseado na config da org.
 * Prioridade: emailFrom > contato@emailDomain > env RESEND_FROM_EMAIL > fallback
 */
function resolveFromEmail(config?: OrgEmailConfig): string {
	if (config?.emailFrom) return config.emailFrom;
	if (config?.emailDomain) return `contato@${config.emailDomain}`;
	return env.RESEND_FROM_EMAIL || 'certificados@geduc.org';
}

export async function sendCertificateEmail(
	to: string,
	participantName: string,
	pdfBuffer: Uint8Array,
	filename: string,
	userId: string,
	orgId?: string,
	orgEmailConfig?: OrgEmailConfig
): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResendClientForCertificates(userId, orgId);
		const fromEmail = resolveFromEmail(orgEmailConfig);
		const orgName = orgEmailConfig?.orgName || 'GEDUC';
		const primaryColor = orgEmailConfig?.primaryColor || '#152db5';

		await resend.emails.send({
			from: fromEmail,
			to,
			subject: `Seu certificado ${orgName} - ${participantName}`,
			html: `
				<div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
					<h1 style="color: ${primaryColor}; font-size: 24px; margin-bottom: 16px;">Certificado ${orgName}</h1>
					<p style="color: #2a2a2a; font-size: 16px; line-height: 1.6;">
						Olá, <strong>${participantName}</strong>!
					</p>
					<p style="color: #2a2a2a; font-size: 16px; line-height: 1.6;">
						Segue em anexo o seu certificado de participação no programa ${orgName}.
					</p>
					<p style="color: #2a2a2a; font-size: 16px; line-height: 1.6;">
						Obrigado pela sua dedicação e contribuição!
					</p>
					<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
					<p style="color: #757575; font-size: 12px;">
						Este é um e-mail automático do sistema ${orgName}. Não responda a este e-mail.
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
	orgId?: string,
	orgEmailConfig?: OrgEmailConfig
): Promise<{ success: boolean; error?: string }> {
	return sendCertificateEmail(testEmail, participantName, pdfBuffer, filename, userId, orgId, orgEmailConfig);
}

export async function sendFormInviteEmail(
	to: string,
	formTitle: string,
	formDescription: string | undefined,
	formUrl: string,
	userId?: string,
	orgId?: string,
	orgEmailConfig?: OrgEmailConfig
): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResendClient(userId, orgId);
		const fromEmail = resolveFromEmail(orgEmailConfig);
		const orgName = orgEmailConfig?.orgName || 'GEDUC';
		const primaryColor = orgEmailConfig?.primaryColor || '#152db5';

		await resend.emails.send({
			from: fromEmail,
			to,
			subject: `${orgName} — Formulário: ${formTitle}`,
			html: `
				<div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
					<h1 style="color: ${primaryColor}; font-size: 24px; margin-bottom: 16px;">${formTitle}</h1>
					${formDescription ? `<p style="color: #2a2a2a; font-size: 16px; line-height: 1.6;">${formDescription}</p>` : ''}
					<p style="color: #2a2a2a; font-size: 16px; line-height: 1.6;">
						Você foi convidado(a) a responder este formulário da organização <strong>${orgName}</strong>.
					</p>
					<p style="margin: 24px 0;">
						<a href="${formUrl}" style="display: inline-block; padding: 14px 28px; background: ${primaryColor}; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">Responder Formulário</a>
					</p>
					<p style="color: #2a2a2a; font-size: 14px;">Caso o botão não funcione, copie e cole o link abaixo no navegador:</p>
					<p style="color: ${primaryColor}; font-size: 14px; word-wrap: break-word;">${formUrl}</p>
					<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
					<p style="color: #757575; font-size: 12px;">
						Este é um e-mail automático do sistema ${orgName}. Não responda a este e-mail.
					</p>
				</div>
			`
		});

		return { success: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Erro desconhecido';
		console.error('Erro ao enviar e-mail de convite de formulário:', message);
		return { success: false, error: message };
	}
}
