import * as XLSX from 'xlsx';

export interface ParsedRow {
	nome: string;
	email: string;
	cargo: string;
	dataInscricao: string | null;
	dataFimCiclo: string | null;
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

/**
 * Mapeia nomes de colunas da planilha para os campos internos.
 */
const COLUMN_MAPPINGS: Record<string, keyof ParsedRow> = {
	nome: 'nome',
	name: 'nome',
	email: 'email',
	'e-mail': 'email',
	'emailaddress': 'email',
	cargo: 'cargo',
	funcao: 'cargo',
	'cargo/funcao': 'cargo',
	role: 'cargo',
	function: 'cargo',
	papel: 'cargo',
	datadeinscricao: 'dataInscricao',
	datainscricao: 'dataInscricao',
	datadeadmissao: 'dataInscricao',
	'datadeinscricao/admissao': 'dataInscricao',
	enrollmentdate: 'dataInscricao',
	datadefimde: 'dataFimCiclo',
	datafimciclo: 'dataFimCiclo',
	datadefimciclo: 'dataFimCiclo',
	'datadefimdo': 'dataFimCiclo',
	cycleenddate: 'dataFimCiclo',
	datafim: 'dataFimCiclo'
};

function resolveColumn(header: string): keyof ParsedRow | null {
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
		// Excel serial date
		const date = XLSX.SSF.parse_date_code(value);
		if (date) {
			const y = date.y;
			const m = String(date.m).padStart(2, '0');
			const d = String(date.d).padStart(2, '0');
			return `${y}-${m}-${d}`;
		}
		return null;
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
 * Parse de planilha (buffer) para array de registros de participantes.
 */
export function parseSpreadsheet(buffer: ArrayBuffer, _filename?: string): ParseResult {
	const workbook = XLSX.read(buffer, { type: 'array' });
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
	const columnMap: Record<string, keyof ParsedRow> = {};

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
			cargo: row.cargo || 'mentorado',
			dataInscricao: row.dataInscricao || null,
			dataFimCiclo: row.dataFimCiclo || null
		});
	}

	return { rows, errors, totalRows: rawData.length };
}
