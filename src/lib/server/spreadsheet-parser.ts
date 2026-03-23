import * as XLSX from 'xlsx';
import { PARTICIPANT_STATUSES, STATUS_LABELS, DEFAULT_CUSTOM_ROLES } from '$lib/constants/participant-status';

export interface ParsedRow {
	nome: string;
	email: string;
	cargo: string;
	status: string;
	dataInscricao: string | null;
	dataFimCiclo: string | null;
	cargaHoraria: number | null;
	observacoes: string | null;
}

export interface ParseResult {
	rows: ParsedRow[];
	errors: { row: number; message: string }[];
	totalRows: number;
}

/**
 * Normaliza o nome de uma coluna para comparação.
 */
function normalizeColumnName(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]/g, '')
		.trim();
}

type ParsedField = keyof ParsedRow;

/**
 * Mapeia nomes de colunas da planilha para os campos internos.
 */
const COLUMN_MAPPINGS: Record<string, ParsedField> = {
	// nome
	nome: 'nome',
	name: 'nome',
	// email
	email: 'email',
	'email': 'email',
	emailaddress: 'email',
	// cargo
	cargo: 'cargo',
	funcao: 'cargo',
	cargofuncao: 'cargo',
	role: 'cargo',
	function: 'cargo',
	papel: 'cargo',
	// status
	status: 'status',
	situacao: 'status',
	// data inscrição
	datadeinscricao: 'dataInscricao',
	datainscricao: 'dataInscricao',
	datadeadmissao: 'dataInscricao',
	datadeinscricaoadmissao: 'dataInscricao',
	enrollmentdate: 'dataInscricao',
	// data fim ciclo
	datadefimde: 'dataFimCiclo',
	datafimciclo: 'dataFimCiclo',
	datadefimciclo: 'dataFimCiclo',
	datadefimdo: 'dataFimCiclo',
	cycleenddate: 'dataFimCiclo',
	datafim: 'dataFimCiclo',
	// carga horária
	cargahoraria: 'cargaHoraria',
	cargahorariahoras: 'cargaHoraria',
	horas: 'cargaHoraria',
	workloadhours: 'cargaHoraria',
	workload: 'cargaHoraria',
	// observações
	observacoes: 'observacoes',
	observacao: 'observacoes',
	notas: 'observacoes',
	notes: 'observacoes',
	obs: 'observacoes',
};

function resolveColumn(header: string): ParsedField | null {
	const normalized = normalizeColumnName(header);
	if (COLUMN_MAPPINGS[normalized]) {
		return COLUMN_MAPPINGS[normalized];
	}
	// Fuzzy match
	for (const [key, value] of Object.entries(COLUMN_MAPPINGS)) {
		if (normalized.includes(key) || key.includes(normalized)) {
			return value;
		}
	}
	return null;
}

/**
 * Converte valores de data de Excel serial number ou string para formato ISO.
 */
function parseDate(value: unknown): string | null {
	if (!value) return null;

	if (typeof value === 'number') {
		// Excel serial date -> JS Date
		// Excel epoch is 1900-01-01 (day 1), with the Lotus 1-2-3 leap year bug (day 60 = Feb 29 1900)
		const excelEpoch = new Date(1899, 11, 30);
		const jsDate = new Date(excelEpoch.getTime() + value * 86400000);
		const y = jsDate.getFullYear();
		const m = String(jsDate.getMonth() + 1).padStart(2, '0');
		const d = String(jsDate.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	const str = String(value).trim();
	if (!str) return null;

	// Try ISO format
	if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
		return str.substring(0, 10);
	}

	// Try dd/mm/yyyy
	const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (match) {
		return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
	}

	return null;
}

/**
 * Normaliza o valor de status da planilha para o valor interno.
 */
function normalizeStatus(value: unknown): string {
	if (!value) return 'inscrito';
	const str = String(value).trim().toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');

	// Direto se já for um valor válido
	if ((PARTICIPANT_STATUSES as readonly string[]).includes(str)) return str;

	// Mapear labels para valores internos
	for (const status of PARTICIPANT_STATUSES) {
		const label = STATUS_LABELS[status]
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');
		if (str === label) return status;
	}

	return 'inscrito';
}

/**
 * Parse de planilha (buffer) para array de registros de participantes.
 */
export function parseSpreadsheet(buffer: ArrayBuffer, filename?: string): ParseResult {
	const isCsv = filename?.toLowerCase().endsWith('.csv');
	const workbook = XLSX.read(buffer, {
		type: 'array',
		...(isCsv ? { codepage: 65001 } : {})
	});
	const sheetName = workbook.SheetNames[0];
	const sheet = workbook.Sheets[sheetName];

	const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
	const rows: ParsedRow[] = [];
	const errors: { row: number; message: string }[] = [];

	if (rawData.length === 0) {
		return { rows: [], errors: [{ row: 0, message: 'Planilha vazia' }], totalRows: 0 };
	}

	// Resolve column mappings from headers
	const headers = Object.keys(rawData[0]);
	const columnMap: Record<string, ParsedField> = {};

	for (const header of headers) {
		const resolved = resolveColumn(header);
		if (resolved) {
			columnMap[header] = resolved;
		}
	}

	// Validate required columns
	const mappedFields = new Set(Object.values(columnMap));
	if (!mappedFields.has('nome')) {
		errors.push({ row: 0, message: 'Coluna "nome" não encontrada na planilha' });
	}
	if (!mappedFields.has('email')) {
		errors.push({ row: 0, message: 'Coluna "e-mail" não encontrada na planilha' });
	}

	if (errors.length > 0) {
		return { rows: [], errors, totalRows: rawData.length };
	}

	for (let i = 0; i < rawData.length; i++) {
		const raw = rawData[i];
		const row: Partial<ParsedRow> = {};

		for (const [header, field] of Object.entries(columnMap)) {
			const value = raw[header];
			if (field === 'dataInscricao' || field === 'dataFimCiclo') {
				row[field] = parseDate(value);
			} else if (field === 'status') {
				row[field] = normalizeStatus(value);
			} else if (field === 'cargaHoraria') {
				const num = Number(value);
				row[field] = !isNaN(num) && num > 0 ? Math.round(num) : null;
			} else {
				row[field] = value ? String(value).trim() : '';
			}
		}

		// Validate
		if (!row.nome) {
			errors.push({ row: i + 2, message: 'Nome vazio' });
			continue;
		}
		if (!row.email) {
			errors.push({ row: i + 2, message: 'E-mail vazio' });
			continue;
		}

		rows.push({
			nome: row.nome || '',
			email: row.email || '',
			cargo: row.cargo || DEFAULT_CUSTOM_ROLES.mentorado[0],
			status: row.status || 'inscrito',
			dataInscricao: row.dataInscricao || null,
			dataFimCiclo: row.dataFimCiclo || null,
			cargaHoraria: row.cargaHoraria ?? null,
			observacoes: row.observacoes || null
		});
	}

	return { rows, errors, totalRows: rawData.length };
}
