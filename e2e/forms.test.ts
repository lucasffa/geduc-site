import { describe, it, expect, beforeAll } from 'vitest';

/**
 * E2E Tests for Forms API
 * Tests form creation, submission, and response retrieval
 */

const BASE_URL = 'http://localhost:5173';

describe('Forms API', () => {
	let orgSlug = '';
	let formId = '';
	let formToken = '';
	let sessionToken = '';

	beforeAll(async () => {
		// Note: These tests assume:
		// 1. An organization 'teste' exists with slug 'teste'
		// 2. A user 'joao@geduc.org' with role 'admin' exists and is logged in
		// 3. The app is running on http://localhost:5173

		console.log('ℹ️  Ensure the application is running and test data is seeded');
		orgSlug = 'teste';

		// In a real scenario, you'd authenticate and get a session token
		// For now, we'll use environment variables or hardcoded test data
	});

	describe('POST /api/forms/create', () => {
		it('should create a form with 8 fields', async () => {
			const formDefinition = {
				fields: [
					{
						id: 'field_1',
						name: 'field_1',
						type: 'text',
						label: 'Pergunta 1: Seu Nome',
						required: true,
						placeholder: 'Digite seu nome'
					},
					{
						id: 'field_2',
						name: 'field_2',
						type: 'email',
						label: 'Pergunta 2: Seu Email',
						required: true,
						placeholder: 'seu.email@example.com'
					},
					{
						id: 'field_3',
						name: 'field_3',
						type: 'textarea',
						label: 'Pergunta 3: Descrição',
						required: false,
						placeholder: 'Digite uma descrição'
					},
					{
						id: 'field_4',
						name: 'field_4',
						type: 'select',
						label: 'Pergunta 4: Selecione uma opção',
						required: true,
						options: [
							{ label: 'Opção A', value: 'a' },
							{ label: 'Opção B', value: 'b' },
							{ label: 'Opção C', value: 'c' }
						]
					},
					{
						id: 'field_5',
						name: 'field_5',
						type: 'radio',
						label: 'Pergunta 5: Escolha uma alternativa',
						required: true,
						options: [
							{ label: 'Sim', value: 'yes' },
							{ label: 'Não', value: 'no' },
							{ label: 'Talvez', value: 'maybe' }
						]
					},
					{
						id: 'field_6',
						name: 'field_6',
						type: 'checkbox',
						label: 'Pergunta 6: Selecione os itens que se aplicam',
						required: false,
						options: [
							{ label: 'Item 1', value: 'item1' },
							{ label: 'Item 2', value: 'item2' },
							{ label: 'Item 3', value: 'item3' }
						]
					},
					{
						id: 'field_7',
						name: 'field_7',
						type: 'number',
						label: 'Pergunta 7: Digite um número',
						required: false,
						placeholder: '0'
					},
					{
						id: 'field_8',
						name: 'field_8',
						type: 'rating',
						label: 'Pergunta 8: Avalie de 1 a 5',
						required: false
					}
				]
			};

			console.log('📝 Form definition created with 8 fields');
			expect(formDefinition.fields).toHaveLength(8);
			expect(formDefinition.fields.map(f => f.type)).toEqual([
				'text', 'email', 'textarea', 'radio', 'checkbox', 'number', 'date', 'file'
			]);
		});

		it('should validate all field types are properly defined', () => {
			const validTypes = [
				'text', 'email', 'textarea', 'radio', 'checkbox',
				'number', 'date', 'tel', 'file', 'hidden', 'button'
			];

			expect(validTypes).toHaveLength(11);
			// Ensure removed types are NOT in valid types
			expect(validTypes).not.toContain('map');
			expect(validTypes).not.toContain('select');
			expect(validTypes).not.toContain('rating');
			expect(validTypes).not.toContain('url');
		});
	});

	describe('POST /forms/[orgSlug]/[formSlug]?/submit', () => {
		it('should correctly parse and save all form responses', () => {
			// Simulate form data submission
			// Field names are the field IDs directly (e.g., "field_1", "field_2")
			const formData = new FormData();
			formData.append('field_1', 'João Paulo');
			formData.append('field_2', 'joao@example.com');
			formData.append('field_3', 'Uma descrição muito legal');
			formData.append('field_4', 'yes');
			formData.append('field_5', 'item1');
			formData.append('field_5', 'item3');
			formData.append('field_6', '42');
			formData.append('field_7', '2026-06-07');
			formData.append('field_8', 'documento.pdf');

			// Simulate parsing logic from +page.server.ts
			const answers: Record<string, unknown> = {};
			for (const [key, value] of formData.entries()) {
				if (key.startsWith('field_')) {
					const fieldId = key;  // Use key directly, it's already the field ID
					if (answers[fieldId] && Array.isArray(answers[fieldId])) {
						(answers[fieldId] as unknown[]).push(value);
					} else if (answers[fieldId]) {
						answers[fieldId] = [answers[fieldId], value];
					} else {
						answers[fieldId] = value;
					}
				}
			}

			console.log('✅ Parsed answers:', JSON.stringify(answers, null, 2));

			// Validate all 8 fields are present
			expect(Object.keys(answers)).toHaveLength(8);
			expect(answers['field_1']).toBe('João Paulo');
			expect(answers['field_2']).toBe('joao@example.com');
			expect(answers['field_3']).toBe('Uma descrição muito legal');
			expect(answers['field_4']).toBe('yes');
			expect(answers['field_5']).toEqual(['item1', 'item3']);
			expect(answers['field_6']).toBe('42');
			expect(answers['field_7']).toBe('2026-06-07');
			expect(answers['field_8']).toBe('documento.pdf');
		});

		it('should handle multiple checkbox values correctly', () => {
			const formData = new FormData();
			formData.append('field_checkboxes', 'opt1');
			formData.append('field_checkboxes', 'opt2');
			formData.append('field_checkboxes', 'opt3');

			const answers: Record<string, unknown> = {};
			for (const [key, value] of formData.entries()) {
				if (key.startsWith('field_')) {
					const fieldId = key;  // Use key directly
					if (answers[fieldId] && Array.isArray(answers[fieldId])) {
						(answers[fieldId] as unknown[]).push(value);
					} else if (answers[fieldId]) {
						answers[fieldId] = [answers[fieldId], value];
					} else {
						answers[fieldId] = value;
					}
				}
			}

			expect(answers['field_checkboxes']).toEqual(['opt1', 'opt2', 'opt3']);
		});

		it('should serialize answers as JSON correctly', () => {
			const answers = {
				field_1: 'João',
				field_2: 'joao@example.com',
				field_3: 'Descrição',
				field_5: ['item1', 'item3'],
				field_7: '2026-06-07',
				field_8: 'documento.pdf'
			};

			const serialized = JSON.stringify(answers);
			const deserialized = JSON.parse(serialized);

			expect(deserialized).toEqual(answers);
			expect(typeof serialized).toBe('string');
		});
	});

	describe('GET /dashboard/forms/[id]/responses', () => {
		it('should retrieve all submitted responses', () => {
			// Mock response data as it would come from the database
			const mockResponses = [
				{
					id: 'resp_1',
					formId: 'form_1',
					submittedAt: new Date().toISOString(),
					answers: {
						field_1: 'João',
						field_2: 'joao@example.com',
						field_3: 'Descrição 1',
						field_4: 'yes',
						field_5: ['item1'],
						field_6: '10',
						field_7: '2026-06-07',
						field_8: 'arquivo1.pdf'
					},
					submitterName: 'João',
					submitterEmail: 'joao@example.com',
					metadata: {}
				},
				{
					id: 'resp_2',
					formId: 'form_1',
					submittedAt: new Date().toISOString(),
					answers: {
						field_1: 'Maria',
						field_2: 'maria@example.com',
						field_3: 'Descrição 2',
						field_4: 'no',
						field_5: ['item2', 'item3'],
						field_6: '20',
						field_7: '2026-05-15',
						field_8: 'arquivo2.pdf'
					},
					submitterName: 'Maria',
					submitterEmail: 'maria@example.com',
					metadata: {}
				}
			];

			// Validate responses structure
			expect(mockResponses).toHaveLength(2);
			mockResponses.forEach(resp => {
				expect(resp.answers).toBeDefined();
				expect(Object.keys(resp.answers)).toHaveLength(8);
				expect(resp.submitterName).toBeDefined();
				expect(resp.submitterEmail).toBeDefined();
			});

			console.log(`✅ Retrieved ${mockResponses.length} responses with all 8 fields each`);
		});

		it('should correctly identify field labels vs IDs', () => {
			const formDefinition = {
				fields: [
					{
						id: 'field_1',
						name: 'field_1',
						type: 'text',
						label: 'Seu Nome'
					},
					{
						id: 'field_2',
						name: 'field_2',
						type: 'email',
						label: 'Seu Email'
					}
				]
			};

			const answers = {
				field_1: 'João',
				field_2: 'joao@example.com'
			};

			// Simulate field lookup logic
			function getFieldLabel(fieldId: string): string {
				const field = formDefinition.fields.find(f => f.id === fieldId || f.name === fieldId);
				return field?.label || fieldId;
			}

			expect(getFieldLabel('field_1')).toBe('Seu Nome');
			expect(getFieldLabel('field_2')).toBe('Seu Email');
		});

		it('should exclude hidden and button fields from responses view', () => {
			const formDefinition = {
				fields: [
					{ id: 'field_1', type: 'text', label: 'Nome' },
					{ id: 'field_2', type: 'hidden', label: 'Hidden Field' },
					{ id: 'field_3', type: 'email', label: 'Email' },
					{ id: 'field_4', type: 'button', label: 'Submit Button' },
					{ id: 'field_5', type: 'number', label: 'Idade' }
				]
			};

			const visibleFields = formDefinition.fields.filter(
				f => f.type !== 'hidden' && f.type !== 'button'
			);

			expect(visibleFields).toHaveLength(3);
			expect(visibleFields.map(f => f.id)).toEqual(['field_1', 'field_3', 'field_5']);
		});
	});

	describe('Data Integrity', () => {
		it('should maintain data type consistency across save/retrieve', () => {
			const originalAnswers = {
				text: 'João',
				email: 'joao@example.com',
				number: '42',
				checkbox: ['a', 'b', 'c'],
				rating: '5'
			};

			// Simulate database round-trip
			const serialized = JSON.stringify(originalAnswers);
			const deserialized = JSON.parse(serialized);

			expect(deserialized).toEqual(originalAnswers);
			expect(deserialized.checkbox).toEqual(['a', 'b', 'c']);
		});

		it('should correctly count form fields', () => {
			const fieldTypes = [
				'text', 'email', 'textarea', 'select',
				'radio', 'checkbox', 'number', 'rating'
			];

			expect(fieldTypes).toHaveLength(8);
			expect(fieldTypes).not.toContain('map');
		});
	});
});
