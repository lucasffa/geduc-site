import { writable } from 'svelte/store';

// ============================================================
// Toast notifications
// ============================================================
interface ToastItem {
	id: string;
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
}

export const toasts = writable<ToastItem[]>([]);

let toastId = 0;

export function addToast(message: string, type: ToastItem['type'] = 'info', durationMs = 4000): void {
	const id = String(++toastId);
	toasts.update((t) => [...t, { id, message, type }]);
	if (durationMs > 0) {
		setTimeout(() => removeToast(id), durationMs);
	}
}

export function removeToast(id: string): void {
	toasts.update((t) => t.filter((item) => item.id !== id));
}

// ============================================================
// Sidebar state
// ============================================================
export const sidebarOpen = writable(false);

export function toggleSidebar(): void {
	sidebarOpen.update((v) => !v);
}

export function closeSidebar(): void {
	sidebarOpen.set(false);
}
