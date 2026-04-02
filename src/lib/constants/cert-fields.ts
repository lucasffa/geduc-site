import type { CertField } from '$lib/types/dashboard';

/**
 * Posições default mapeadas para corresponder ao gerador padrão GEDUC.
 * y=0 é o topo, y=100 é a base (invertido em relação ao sistema pdf-lib).
 * x=50 + align=center = centralizado horizontalmente.
 */
export const DEFAULT_CERT_FIELDS: CertField[] = [
	{
		key: 'participantName',
		label: 'Nome',
		enabled: true,
		x: 50,
		y: 38,
		fontSize: 28,
		fontId: null,
		bold: true,
		color: '#141cb4',
		align: 'center'
	},
	{
		key: 'role',
		label: 'Cargo / Função',
		enabled: true,
		x: 50,
		y: 45,
		fontSize: 14,
		fontId: null,
		bold: false,
		color: '#292929',
		align: 'center'
	},
	{
		key: 'workloadHours',
		label: 'Carga Horária',
		enabled: true,
		x: 50,
		y: 50,
		fontSize: 14,
		fontId: null,
		bold: false,
		color: '#292929',
		align: 'center'
	},
	{
		key: 'period',
		label: 'Período',
		enabled: true,
		x: 50,
		y: 55,
		fontSize: 12,
		fontId: null,
		bold: false,
		color: '#4a4a4a',
		align: 'center'
	},
	{
		key: 'issueDate',
		label: 'Data de Emissão',
		enabled: true,
		x: 50,
		y: 85,
		fontSize: 11,
		fontId: null,
		bold: false,
		color: '#757575',
		align: 'center'
	},
	{
		key: 'validationCode',
		label: 'Código de Validação',
		enabled: true,
		x: 50,
		y: 95,
		fontSize: 7,
		fontId: null,
		bold: false,
		color: '#a0a0a0',
		align: 'center'
	}
];

/** Cores dos chips no editor visual (independentes da cor do texto no cert). */
export const FIELD_CHIP_COLORS: Record<string, string> = {
	participantName: '#2563eb',
	role: '#16a34a',
	workloadHours: '#d97706',
	period: '#7c3aed',
	issueDate: '#6b7280',
	validationCode: '#9ca3af'
};
