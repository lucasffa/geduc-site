import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import type { CertField } from '$lib/types/dashboard';
import { DEFAULT_CERT_FIELDS } from '$lib/constants/cert-fields';

export interface CertificateData {
	participantName: string;
	role: string;
	workloadHours: number;
	periodStart: string;
	periodEnd: string;
}

export interface GenerateOptions {
	fields?: CertField[];
	fontsDir?: string;
}

// ============================================================
// Helpers
// ============================================================

function formatDateBR(dateStr: string): string {
	const d = new Date(dateStr + 'T00:00:00');
	return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function hexToRgb(hex: string): [number, number, number] {
	const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!m) return [0, 0, 0];
	return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

function fieldText(field: CertField, data: CertificateData): string {
	switch (field.key) {
		case 'participantName': return data.participantName;
		case 'role':            return data.role;
		case 'workloadHours':   return `${data.workloadHours} horas`;
		case 'period':          return `${formatDateBR(data.periodStart)} a ${formatDateBR(data.periodEnd)}`;
		case 'issueDate':
			return new Date().toLocaleDateString('pt-BR', {
				day: '2-digit', month: 'long', year: 'numeric'
			});
	}
}

/** Cache de fontes por fontId dentro de uma geração (evita re-embed do mesmo arquivo). */
async function buildFontCache(
	pdfDoc: PDFDocument,
	fields: CertField[],
	fontsDir?: string
): Promise<Map<string, PDFFont>> {
	const cache = new Map<string, PDFFont>();

	for (const field of fields) {
		if (!field.enabled) continue;

		const cacheKey = field.fontId
			? `custom:${field.fontId}`
			: `std:${field.bold ? 'bold' : 'regular'}`;

		if (cache.has(cacheKey)) continue;

		if (field.fontId && fontsDir) {
			const candidates = [
				path.join(fontsDir, `${field.fontId}.ttf`),
				path.join(fontsDir, `${field.fontId}.otf`)
			];
			for (const fp of candidates) {
				if (fs.existsSync(fp)) {
					const bytes = fs.readFileSync(fp);
					cache.set(cacheKey, await pdfDoc.embedFont(bytes));
					break;
				}
			}
		}

		if (!cache.has(cacheKey)) {
			const std = field.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
			cache.set(cacheKey, await pdfDoc.embedFont(std));
		}
	}

	return cache;
}

function resolveFont(field: CertField, fontCache: Map<string, PDFFont>): PDFFont {
	const cacheKey = field.fontId
		? `custom:${field.fontId}`
		: `std:${field.bold ? 'bold' : 'regular'}`;
	// fallback garantido (cache sempre preenchido para campos enabled)
	return fontCache.get(cacheKey) ?? fontCache.get('std:regular')!;
}

async function drawFields(
	page: PDFPage,
	pdfDoc: PDFDocument,
	data: CertificateData,
	fields: CertField[],
	fontsDir?: string
): Promise<void> {
	const { width, height } = page.getSize();
	const fontCache = await buildFontCache(pdfDoc, fields, fontsDir);

	for (const field of fields) {
		if (!field.enabled) continue;

		const font = resolveFont(field, fontCache);
		const text = fieldText(field, data);
		const [r, g, b] = hexToRgb(field.color);
		const textWidth = font.widthOfTextAtSize(text, field.fontSize);

		// x: âncora percentual → pixel
		const xAnchor = (field.x / 100) * width;
		let x: number;
		if (field.align === 'center') x = xAnchor - textWidth / 2;
		else if (field.align === 'right') x = xAnchor - textWidth;
		else x = xAnchor;

		// y: 0=topo UI → converter para sistema pdf-lib (0=base)
		const y = height * (1 - field.y / 100);

		page.drawText(text, { x, y, size: field.fontSize, font, color: rgb(r, g, b) });
	}
}

// ============================================================
// Gerador principal
// ============================================================

export async function generateCertificatePdf(
	data: CertificateData,
	templatePath?: string,
	options: GenerateOptions = {}
): Promise<Uint8Array> {
	const fields = options.fields ?? DEFAULT_CERT_FIELDS;
	const fontsDir = options.fontsDir;

	if (templatePath && fs.existsSync(templatePath)) {
		return generateFromTemplate(data, templatePath, fields, fontsDir);
	}
	return generateDefaultCertificate(data, fields, fontsDir);
}

async function generateFromTemplate(
	data: CertificateData,
	templatePath: string,
	fields: CertField[],
	fontsDir?: string
): Promise<Uint8Array> {
	const templateBytes = fs.readFileSync(templatePath);
	const pdfDoc = await PDFDocument.load(templateBytes);
	pdfDoc.registerFontkit(fontkit);
	const page = pdfDoc.getPages()[0];

	await drawFields(page, pdfDoc, data, fields, fontsDir);

	return pdfDoc.save();
}

async function generateDefaultCertificate(
	data: CertificateData,
	fields: CertField[],
	fontsDir?: string
): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.create();
	pdfDoc.registerFontkit(fontkit);
	const page = pdfDoc.addPage([842, 595]); // A4 landscape
	const { width, height } = page.getSize();

	const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

	// Background
	page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.98, 1) });

	// Border
	const bm = 30;
	page.drawRectangle({
		x: bm, y: bm, width: width - bm * 2, height: height - bm * 2,
		borderColor: rgb(0.08, 0.11, 0.71), borderWidth: 3, color: rgb(1, 1, 1)
	});
	page.drawRectangle({
		x: bm + 8, y: bm + 8, width: width - (bm + 8) * 2, height: height - (bm + 8) * 2,
		borderColor: rgb(0.08, 0.11, 0.71), borderWidth: 0.5
	});

	// Título decorativo estático
	const title = 'CERTIFICADO';
	const titleSize = 36;
	page.drawText(title, {
		x: (width - fontBold.widthOfTextAtSize(title, titleSize)) / 2,
		y: height - 100,
		size: titleSize, font: fontBold, color: rgb(0.08, 0.11, 0.71)
	});

	const subtitle = 'GEDUC - Grupo de Educação';
	const subtitleSize = 14;
	page.drawText(subtitle, {
		x: (width - fontRegular.widthOfTextAtSize(subtitle, subtitleSize)) / 2,
		y: height - 125,
		size: subtitleSize, font: fontRegular, color: rgb(0.46, 0.46, 0.46)
	});

	const intro = 'Certificamos que';
	page.drawText(intro, {
		x: (width - fontRegular.widthOfTextAtSize(intro, 14)) / 2,
		y: height - 190,
		size: 14, font: fontRegular, color: rgb(0.16, 0.16, 0.16)
	});

	// Linha de assinatura estática
	page.drawLine({
		start: { x: width / 2 - 100, y: bm + 90 },
		end:   { x: width / 2 + 100, y: bm + 90 },
		thickness: 0.5, color: rgb(0.46, 0.46, 0.46)
	});
	const sigText = 'Coordenação GEDUC';
	page.drawText(sigText, {
		x: (width - fontRegular.widthOfTextAtSize(sigText, 10)) / 2,
		y: bm + 75,
		size: 10, font: fontRegular, color: rgb(0.46, 0.46, 0.46)
	});

	// Campos configuráveis
	await drawFields(page, pdfDoc, data, fields, fontsDir);

	return pdfDoc.save();
}

// ============================================================
// Diretórios
// ============================================================

const DB_DIR   = process.env.DB_DIR || path.resolve('data');
const FILES_DIR = path.join(DB_DIR, 'files');

export function getCertificatesDir(slug: string): string {
	const dir = path.join(FILES_DIR, slug, 'certificates');
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return dir;
}

export function getTemplatesDir(slug: string): string {
	const dir = path.join(FILES_DIR, slug, 'templates');
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return dir;
}

export function getFontsDir(slug: string): string {
	const dir = path.join(FILES_DIR, slug, 'fonts');
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return dir;
}
