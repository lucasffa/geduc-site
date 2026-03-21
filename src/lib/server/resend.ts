import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

function getResendClient(): Resend {
	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) {
		throw new Error('RESEND_API_KEY is not set');
	}
	return new Resend(apiKey);
}

export async function sendCertificateEmail(
	to: string,
	participantName: string,
	pdfBuffer: Uint8Array,
	filename: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResendClient();
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

export async function sendTestEmail(
	testEmail: string,
	participantName: string,
	pdfBuffer: Uint8Array,
	filename: string
): Promise<{ success: boolean; error?: string }> {
	return sendCertificateEmail(testEmail, participantName, pdfBuffer, filename);
}
