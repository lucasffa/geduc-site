import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface CertificateData {
	participantName: string;
	role: string;
	workloadHours: number;
	periodStart: string;
	periodEnd: string;
}

function formatDateBR(dateStr: string): string {
	const d = new Date(dateStr + 'T00:00:00');
	return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Gera um certificado PDF usando um template existente ou criando um do zero.
 */
export async function generateCertificatePdf(
	data: CertificateData,
	templatePath?: string
): Promise<Uint8Array> {
	if (templatePath && fs.existsSync(templatePath)) {
		return generateFromTemplate(data, templatePath);
	}
	return generateDefaultCertificate(data);
}

/**
 * Gera certificado escrevendo sobre um PDF template existente.
 */
async function generateFromTemplate(
	data: CertificateData,
	templatePath: string
): Promise<Uint8Array> {
	const templateBytes = fs.readFileSync(templatePath);
	const pdfDoc = await PDFDocument.load(templateBytes);
	const pages = pdfDoc.getPages();
	const page = pages[0];
	const { width, height } = page.getSize();

	const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

	// Nome do participante (centralizado, posição ajustável)
	const nameSize = 28;
	const nameWidth = font.widthOfTextAtSize(data.participantName, nameSize);
	page.drawText(data.participantName, {
		x: (width - nameWidth) / 2,
		y: height * 0.55,
		size: nameSize,
		font,
		color: rgb(0.08, 0.11, 0.64)
	});

	// Cargo/função
	const roleText = `Função: ${data.role}`;
	const roleWidth = fontRegular.widthOfTextAtSize(roleText, 14);
	page.drawText(roleText, {
		x: (width - roleWidth) / 2,
		y: height * 0.48,
		size: 14,
		font: fontRegular,
		color: rgb(0.16, 0.16, 0.16)
	});

	// Carga horária
	const hoursText = `Carga horária: ${data.workloadHours} horas`;
	const hoursWidth = fontRegular.widthOfTextAtSize(hoursText, 14);
	page.drawText(hoursText, {
		x: (width - hoursWidth) / 2,
		y: height * 0.43,
		size: 14,
		font: fontRegular,
		color: rgb(0.16, 0.16, 0.16)
	});

	// Período
	const periodText = `Período: ${formatDateBR(data.periodStart)} a ${formatDateBR(data.periodEnd)}`;
	const periodWidth = fontRegular.widthOfTextAtSize(periodText, 12);
	page.drawText(periodText, {
		x: (width - periodWidth) / 2,
		y: height * 0.38,
		size: 12,
		font: fontRegular,
		color: rgb(0.29, 0.29, 0.29)
	});

	return await pdfDoc.save();
}

/**
 * Gera um certificado padrão quando não há template.
 */
async function generateDefaultCertificate(data: CertificateData): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([842, 595]); // A4 landscape
	const { width, height } = page.getSize();

	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

	// Background
	page.drawRectangle({
		x: 0,
		y: 0,
		width,
		height,
		color: rgb(0.98, 0.98, 1)
	});

	// Border
	const borderMargin = 30;
	page.drawRectangle({
		x: borderMargin,
		y: borderMargin,
		width: width - borderMargin * 2,
		height: height - borderMargin * 2,
		borderColor: rgb(0.08, 0.11, 0.71),
		borderWidth: 3,
		color: rgb(1, 1, 1)
	});

	// Inner border
	page.drawRectangle({
		x: borderMargin + 8,
		y: borderMargin + 8,
		width: width - (borderMargin + 8) * 2,
		height: height - (borderMargin + 8) * 2,
		borderColor: rgb(0.08, 0.11, 0.71),
		borderWidth: 0.5
	});

	// Title
	const title = 'CERTIFICADO';
	const titleSize = 36;
	const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
	page.drawText(title, {
		x: (width - titleWidth) / 2,
		y: height - 100,
		size: titleSize,
		font: fontBold,
		color: rgb(0.08, 0.11, 0.71)
	});

	// Subtitle
	const subtitle = 'GEDUC - Grupo de Educação';
	const subtitleSize = 14;
	const subtitleWidth = fontRegular.widthOfTextAtSize(subtitle, subtitleSize);
	page.drawText(subtitle, {
		x: (width - subtitleWidth) / 2,
		y: height - 125,
		size: subtitleSize,
		font: fontRegular,
		color: rgb(0.46, 0.46, 0.46)
	});

	// Body text
	const bodyLine1 = 'Certificamos que';
	const bl1Width = fontRegular.widthOfTextAtSize(bodyLine1, 14);
	page.drawText(bodyLine1, {
		x: (width - bl1Width) / 2,
		y: height - 190,
		size: 14,
		font: fontRegular,
		color: rgb(0.16, 0.16, 0.16)
	});

	// Name
	const nameSize = 28;
	const nameWidth = fontBold.widthOfTextAtSize(data.participantName, nameSize);
	page.drawText(data.participantName, {
		x: (width - nameWidth) / 2,
		y: height - 230,
		size: nameSize,
		font: fontBold,
		color: rgb(0.08, 0.11, 0.64)
	});

	// Role line
	const roleLine = `participou como ${data.role} do programa GEDUC,`;
	const rlWidth = fontRegular.widthOfTextAtSize(roleLine, 13);
	page.drawText(roleLine, {
		x: (width - rlWidth) / 2,
		y: height - 270,
		size: 13,
		font: fontRegular,
		color: rgb(0.16, 0.16, 0.16)
	});

	// Hours line
	const hoursLine = `com carga horária total de ${data.workloadHours} horas,`;
	const hlWidth = fontRegular.widthOfTextAtSize(hoursLine, 13);
	page.drawText(hoursLine, {
		x: (width - hlWidth) / 2,
		y: height - 295,
		size: 13,
		font: fontRegular,
		color: rgb(0.16, 0.16, 0.16)
	});

	// Period line
	const periodLine = `no período de ${formatDateBR(data.periodStart)} a ${formatDateBR(data.periodEnd)}.`;
	const plWidth = fontRegular.widthOfTextAtSize(periodLine, 13);
	page.drawText(periodLine, {
		x: (width - plWidth) / 2,
		y: height - 320,
		size: 13,
		font: fontRegular,
		color: rgb(0.16, 0.16, 0.16)
	});

	// Date line at bottom
	const now = new Date();
	const dateLine = now.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	});
	const dlWidth = fontRegular.widthOfTextAtSize(dateLine, 11);
	page.drawText(dateLine, {
		x: (width - dlWidth) / 2,
		y: borderMargin + 60,
		size: 11,
		font: fontRegular,
		color: rgb(0.46, 0.46, 0.46)
	});

	// Signature line
	page.drawLine({
		start: { x: width / 2 - 100, y: borderMargin + 90 },
		end: { x: width / 2 + 100, y: borderMargin + 90 },
		thickness: 0.5,
		color: rgb(0.46, 0.46, 0.46)
	});

	const sigText = 'Coordenação GEDUC';
	const sigWidth = fontRegular.widthOfTextAtSize(sigText, 10);
	page.drawText(sigText, {
		x: (width - sigWidth) / 2,
		y: borderMargin + 75,
		size: 10,
		font: fontRegular,
		color: rgb(0.46, 0.46, 0.46)
	});

	return await pdfDoc.save();
}

/**
 * Retorna o diretório de armazenamento dos certificados gerados.
 * Cria o diretório se não existir.
 */
export function getCertificatesDir(): string {
	const dir = path.resolve('static', 'certificates');
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	return dir;
}

/**
 * Retorna o diretório de templates de certificados.
 */
export function getTemplatesDir(): string {
	const dir = path.resolve('static', 'certificate-templates');
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	return dir;
}
