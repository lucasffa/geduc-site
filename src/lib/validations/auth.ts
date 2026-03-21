import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().email('E-mail inválido'),
	password: z.string().min(1, 'Senha obrigatória')
});

export const registerSchema = z.object({
	name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
	password: z
		.string()
		.min(8, 'Senha deve ter ao menos 8 caracteres'),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Senhas não conferem',
	path: ['confirmPassword']
});

export const inviteSchema = z.object({
	email: z.string().email('E-mail inválido'),
	role: z.enum(['admin', 'volunteer', 'mentee', 'dumb']),
	name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').optional()
});

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, 'Senha atual obrigatória'),
	newPassword: z
		.string()
		.min(8, 'Nova senha deve ter ao menos 8 caracteres'),
	confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: 'Senhas não conferem',
	path: ['confirmPassword']
});
