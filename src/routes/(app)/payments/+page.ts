import type { PageLoad } from './$types';
import type { Payment } from '$lib/types/payment';

export const load: PageLoad = async ({ fetch, parent }) => {
	const parentData = await parent();
	const isAdmin = parentData?.user?.global_role === 'ADMIN';

	const loadHistory = async (): Promise<{ payments: Payment[]; error: string | null }> => {
		try {
			const endpoint = isAdmin ? '/api/payment/all' : '/api/payment/history';
			const res = await fetch(endpoint);
			const result = await res.json();

			if (!res.ok || !result.data) {
				return { payments: [], error: result.message || result.error || 'Failed to load payments' };
			}

			return { payments: result.data ?? [], error: null };
		} catch {
			return { payments: [], error: 'Network error while loading payments' };
		}
	};

	return {
		historyPromise: loadHistory(),
		isAdmin
	};
};
