import { describe, expect, it } from 'vitest';
import { parseAndValidateFormDefinition } from './form-definition-schema';

describe('form definition validation', () => {
	it('parses a valid definition', () => {
		const definition = parseAndValidateFormDefinition(
			JSON.stringify({
				fields: [{ id: 'f1', name: 'f1', type: 'text', label: 'Pergunta 1' }],
				sections: [{ id: 's1', title: 'Página 1', order: 0, fields: [{ id: 'f1', name: 'f1', type: 'text', label: 'Pergunta 1' }] }]
			})
		);
		expect(definition.fields).toHaveLength(1);
	});

	it('fails when section field is not declared', () => {
		expect(() =>
			parseAndValidateFormDefinition(
				JSON.stringify({
					fields: [],
					sections: [{ id: 's1', title: 'Página 1', order: 0, fields: [{ id: 'ghost', name: 'ghost', type: 'text', label: 'X' }] }]
				})
			)
		).toThrow();
	});
});
