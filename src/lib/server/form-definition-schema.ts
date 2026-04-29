import { z } from 'zod';

const fieldTypeSchema = z.enum([
	'text',
	'email',
	'textarea',
	'select',
	'radio',
	'checkbox',
	'number',
	'date',
	'tel',
	'url',
	'file',
	'rating',
	'map',
	'hidden',
	'button'
]);

const optionSchema = z.object({
	label: z.string().min(1),
	value: z.string().min(1)
});

const fieldSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	type: fieldTypeSchema,
	label: z.string().min(1),
	description: z.string().optional(),
	placeholder: z.string().optional(),
	required: z.boolean().optional(),
	options: z.array(optionSchema).optional(),
	defaultValue: z.unknown().optional(),
	validations: z.record(z.string(), z.unknown()).optional(),
	metadata: z.record(z.string(), z.unknown()).optional()
});

const sectionRuleSchema = z.object({
	id: z.string().min(1),
	fieldId: z.string().min(1),
	operator: z.string().min(1),
	value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
	targetSectionId: z.string().min(1)
});

const sectionSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	fields: z.array(fieldSchema),
	order: z.number(),
	rules: z.array(sectionRuleSchema).optional()
});

const themeSchema = z.object({
	primaryColor: z.string().optional(),
	backgroundColor: z.string().optional(),
	fontFamily: z.string().optional(),
	headerImage: z.string().optional()
});

const formDefinitionSchema = z.object({
	fields: z.array(fieldSchema),
	sections: z.array(sectionSchema).optional(),
	rules: z.array(z.unknown()).optional(),
	layout: z.record(z.string(), z.unknown()).optional(),
	theme: themeSchema.optional()
});

export function parseAndValidateFormDefinition(input: string | null | undefined) {
	let parsed: unknown;
	try {
		parsed = JSON.parse(input || '{"fields":[]}');
	} catch {
		throw new Error('Definição do formulário inválida');
	}

	const definition = formDefinitionSchema.parse(parsed);
	const fieldIds = new Set(definition.fields.map((field) => field.id));
	if (definition.sections) {
		const sectionIds = new Set(definition.sections.map((section) => section.id));
		for (const section of definition.sections) {
			for (const field of section.fields) {
				if (!fieldIds.has(field.id)) {
					throw new Error(`Campo ${field.id} em seção não existe no formulário`);
				}
			}
			for (const rule of section.rules ?? []) {
				if (!sectionIds.has(rule.targetSectionId)) {
					throw new Error(`Seção alvo ${rule.targetSectionId} não existe`);
				}
			}
		}
	}

	return definition;
}
