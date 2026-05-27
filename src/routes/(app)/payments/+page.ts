import type { PageLoad } from './$types';
import type { Payment } from '$lib/types/payment';

export const load: PageLoad = async ({ fetch }) => {
	const loadHistory = async (): Promise<{ payments: Payment[]; error: string | null }> => {
		try {
			const res = await fetch('/api/payment/history');
			const result = await res.json();

			if (!res.ok || !result.success) {
				return { payments: [], error: result.error || 'Failed to load payment history' };
			}

			return { payments: result.data ?? [], error: null };
		} catch {
			return { payments: [], error: 'Network error while loading payments' };
		}
	};

	return {
		historyPromise: loadHistory()
	};
};
