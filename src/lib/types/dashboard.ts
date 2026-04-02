import type { ParticipantStatus } from '$lib/constants/participant-status';

export interface Participant {
	id: number;
	name: string;
	email: string;
	role: string;
	status: ParticipantStatus;
	enrollmentDate: string | null;
	cycleEndDate: string | null;
	workloadHours: number | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface StatusHistoryEntry {
	id: number;
	participantId: number;
	fromStatus: string | null;
	toStatus: string;
	changedAt: string;
	changedBy: string | null;
	participantName?: string;
}

export interface CertificateTemplate {
	id: string;
	name: string;
	originalFilename: string | null;
	createdBy: string | null;
	createdAt: string;
}

export interface Certificate {
	id: string;
	participantId: string;
	templateId: string | null;
	workloadHours: number | null;
	periodStart: string | null;
	periodEnd: string | null;
	pdfPath: string | null;
	sentAt: string | null;
	sentToEmail: string | null;
	validationCode: string | null;
	status: string;
	createdAt: string;
}

export interface StatsData {
	total: number;
	byStatus: Record<string, number>;
	byRole: Record<string, number>;
	certificates: {
		total: number;
		sent: number;
	};
	recentActivity: StatusHistoryEntry[];
}

export interface ImportResult {
	imported: number;
	errors: { row: number; message: string }[];
	totalRows: number;
	error?: string;
}

export interface PaginationData {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface ToastData {
	message: string;
	type: string;
}

export interface TemplateInfo {
	id: string;
	name: string;
	originalFilename: string | null;
}

export interface FontInfo {
	id: string;
	name: string;
	originalFilename: string | null;
	createdAt: string;
}

export type FieldKey = 'participantName' | 'role' | 'workloadHours' | 'period' | 'issueDate' | 'validationCode';
export type FieldAlign = 'left' | 'center' | 'right';

export interface CertField {
	key: FieldKey;
	label: string;
	enabled: boolean;
	/** 0–100: percentual da largura da página (ponto âncora) */
	x: number;
	/** 0–100: percentual da altura da página (de cima para baixo) */
	y: number;
	fontSize: number;
	/** null = fonte padrão (Helvetica) */
	fontId: string | null;
	bold: boolean;
	color: string; // hex, ex: '#141cb4'
	align: FieldAlign;
}
