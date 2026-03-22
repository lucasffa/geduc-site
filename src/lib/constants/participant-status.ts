export const PARTICIPANT_STATUSES = [
	'inscrito',
	'entrevistando',
	'admitido',
	'ativo',
	'aprovado_sem_bolsa',
	'aprovado_com_bolsa',
	'desativado',
	'certificado_processando',
	'certificado_enviado'
] as const;

export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number];

export const STATUS_LABELS: Record<ParticipantStatus, string> = {
	inscrito: 'Inscrito',
	entrevistando: 'Entrevistando',
	admitido: 'Admitido',
	ativo: 'Ativo',
	aprovado_sem_bolsa: 'Aprovado sem bolsa',
	aprovado_com_bolsa: 'Aprovado com bolsa',
	desativado: 'Desativado',
	certificado_processando: 'Certificado em processamento',
	certificado_enviado: 'Certificado enviado'
};

export const STATUS_COLORS: Record<ParticipantStatus, string> = {
	inscrito: 'var(--color-blue-500)',
	entrevistando: 'var(--color-yellow-600)',
	admitido: 'var(--color-green-400)',
	ativo: 'var(--color-green-600)',
	aprovado_sem_bolsa: 'var(--color-primary-500)',
	aprovado_com_bolsa: 'var(--color-primary-700)',
	desativado: 'var(--color-red-500)',
	certificado_processando: 'var(--color-yellow-700)',
	certificado_enviado: 'var(--color-green-800)'
};

// Transições válidas de status
export const VALID_TRANSITIONS: Record<ParticipantStatus, ParticipantStatus[]> = {
	inscrito: ['entrevistando', 'admitido', 'desativado'],
	entrevistando: ['admitido', 'desativado'],
	admitido: ['ativo', 'desativado'],
	ativo: ['aprovado_sem_bolsa', 'aprovado_com_bolsa', 'desativado'],
	aprovado_sem_bolsa: ['certificado_processando', 'desativado'],
	aprovado_com_bolsa: ['certificado_processando', 'desativado'],
	desativado: ['ativo', 'inscrito'],
	certificado_processando: ['certificado_enviado', 'desativado'],
	certificado_enviado: []
};

export const PARTICIPANT_ROLES = [
	'mentor',
	'mentorado',
	'equipe',
	'coordenador',
	'voluntário'
] as const;

export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];

export const ROLE_LABELS: Record<ParticipantRole, string> = {
	mentor: 'Mentor',
	mentorado: 'Mentorado',
	equipe: 'Equipe',
	coordenador: 'Coordenador',
	voluntário: 'Voluntário'
};
