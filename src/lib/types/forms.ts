export type FormFieldType =
	| 'text'
	| 'email'
	| 'textarea'
	| 'select'
	| 'radio'
	| 'checkbox'
	| 'number'
	| 'date'
	| 'tel'
	| 'url'
	| 'file'
	| 'rating'
	| 'map'
	| 'hidden'
	| 'button';

export type FormConditionOperator =
	| 'equals'
	| 'not_equals'
	| 'filled'
	| 'not_filled'
	| 'contains'
	| 'greater_than'
	| 'less_than';

export type FormConditionTrigger = 'onChange' | 'onClick' | 'onSubmit';

export type FormActionType = 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'fetchData';

export interface FormFieldOption {
	label: string;
	value: string;
}

export interface FormFieldDefinition {
	id: string;
	name: string;
	type: FormFieldType;
	label: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
	options?: FormFieldOption[];
	defaultValue?: string | number | boolean | null;
	validations?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
}

export interface FormCondition {
	id: string;
	trigger: FormConditionTrigger;
	when: {
		fieldId: string;
		operator: FormConditionOperator;
		value?: string | number | boolean | null;
	};
	action: {
		type: FormActionType;
		targetFieldId: string;
		value?: unknown;
	};
}

export interface FormTheme {
	primaryColor?: string;
	backgroundColor?: string;
	fontFamily?: string;
	headerImage?: string;
}

export interface FormSectionRule {
	id: string;
	fieldId: string;
	operator: FormConditionOperator;
	value?: string | number | boolean | null;
	targetSectionId: string;
}

export interface FormSection {
	id: string;
	title: string;
	description?: string;
	fields: FormFieldDefinition[];
	order: number;
	rules?: FormSectionRule[];
}

export interface FormDefinition {
	fields: FormFieldDefinition[];
	sections?: FormSection[];
	rules?: FormCondition[];
	layout?: Record<string, unknown>;
	theme?: FormTheme;
}

export interface FormMetadataBase {
	title: string;
	slug?: string;
	description?: string;
	isPublic?: boolean;
	requiresAuth?: boolean;
	isActive?: boolean;
	publicToken?: string;
	authorId?: string;
	authorName?: string;
	authorRole?: string;
	definition: FormDefinition;
}

export interface CreateFormInput extends FormMetadataBase {}

export interface UpdateFormInput extends Partial<FormMetadataBase> {}

export interface FormRecord extends FormMetadataBase {
	id: string;
	createdAt: string;
	updatedAt: string;
}

export interface FormResponseData {
	answers: Record<string, unknown>;
	participantId?: string;
	submitterId?: string;
	submitterName?: string;
	submitterEmail?: string;
	sourceIp?: string;
	sourceUserAgent?: string;
	metadata?: Record<string, unknown>;
}

export interface FormResponseRecord extends FormResponseData {
	id: string;
	formId: string;
	submittedAt: string;
}

export interface SubmitFormResponseInput extends FormResponseData {
	formId: string;
}
