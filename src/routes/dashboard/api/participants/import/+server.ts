import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { participants } from '$lib/server/db/schema';
import { parseSpreadsheet } from '$lib/server/spreadsheet-parser';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;

		if (!file) {
			return json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
		}

		const buffer = await file.arrayBuffer();
		const result = parseSpreadsheet(buffer, file.name);

		if (result.errors.length > 0 && result.rows.length === 0) {
			return json({
				error: 'Nenhuma linha válida na planilha',
				errors: result.errors
			}, { status: 400 });
		}

		// Insert valid rows into the database
		const inserted = [];
		for (const row of result.rows) {
			const [created] = await db.insert(participants).values({
				name: row.nome,
				email: row.email,
				role: row.cargo,
				status: 'inscrito',
				enrollmentDate: row.dataInscricao,
				cycleEndDate: row.dataFimCiclo
			}).returning();
			inserted.push(created);
		}

		return json({
			imported: inserted.length,
			errors: result.errors,
			totalRows: result.totalRows
		}, { status: 201 });
	} catch (error) {
		console.error('Erro na importação:', error);
		return json({ error: 'Erro ao processar planilha' }, { status: 500 });
	}
};
