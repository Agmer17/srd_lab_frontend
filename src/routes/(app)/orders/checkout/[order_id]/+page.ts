import type { PageLoad } from './$types';
import type { ApiResponse } from '$lib/types/api';

export const load: PageLoad = async ({ params, fetch }) => {
	const orderId = params.order_id;
	
	const loadOrder = async () => {
		const res = await fetch(`/api/orders/${orderId}`);
		const result: ApiResponse<any> = await res.json();
		
		if (!res.ok) {
			return { order: null, error: String((result as any).error || (result as any).message || 'Error loading order') };
		}
		if (!(result as any).data) {
			return { order: null, error: 'Order not found' };
		}
		
		return { order: (result as any).data };
	};

	return {
		orderPromise: loadOrder()
	};
};
