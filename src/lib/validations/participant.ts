import { z } from 'zod';
import { PARTICIPANT_STATUSES } from '$lib/constants/participant-status';

export const participantSchema = z.object({
	name: z.string().min(1, 'Nome é obrigatório').max(255),
	email: z.string().email('E-mail inválido').max(255),
	role: z.string().min(1, 'Cargo é obrigatório').max(100),
	status: z.enum(PARTICIPANT_STATUSES).default('inscrito'),
	enrollmentDate: z.string().nullable().optional(),
	cycleEndDate: z.string().nullable().optional(),
	workloadHours: z.number().int().positive().nullable().optional(),
	notes: z.string().nullable().optional()
});

export const participantUpdateSchema = participantSchema.partial();

export const statusTransitionSchema = z.object({
	newStatus: z.enum(PARTICIPANT_STATUSES),
	changedBy: z.string().optional()
});

export const importRowSchema = z.object({
	nome: z.string().min(1),
	'e-mail': z.string().email().or(z.string().min(1)),
	'cargo/função': z.string().optional().default('mentorado'),
	'data de inscrição/admissão': z.string().optional().nullable(),
	'data de fim de ciclo': z.string().optional().nullable()
});

export const certificateConfigSchema = z.object({
	participantIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos um participante'),
	workloadHours: z.number().int().positive('Carga horária deve ser positiva'),
	periodStart: z.string().min(1, 'Data início é obrigatória'),
	periodEnd: z.string().min(1, 'Data fim é obrigatória'),
	templateName: z.string().optional().default('default')
});

export const sendCertificateSchema = z.object({
	certificateIds: z.array(z.string().uuid()).min(1)
});

export const testEmailSchema = z.object({
	certificateId: z.string().uuid(),
	testEmail: z.string().email('E-mail de teste inválido')
});

export type ParticipantInput = z.infer<typeof participantSchema>;
export type ParticipantUpdate = z.infer<typeof participantUpdateSchema>;
export type StatusTransition = z.infer<typeof statusTransitionSchema>;
export type ImportRow = z.infer<typeof importRowSchema>;
export type CertificateConfig = z.infer<typeof certificateConfigSchema>;
