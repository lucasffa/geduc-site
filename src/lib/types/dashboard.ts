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

export interface Certificate {
	id: number;
	participantId: number;
	templateName: string | null;
	workloadHours: number | null;
	periodStart: string | null;
	periodEnd: string | null;
	pdfPath: string | null;
	sentAt: string | null;
	sentToEmail: string | null;
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
	name: string;
	filename: string;
}
