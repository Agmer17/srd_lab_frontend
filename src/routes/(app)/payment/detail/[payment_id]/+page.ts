import type { PageLoad } from './$types';
import type { ApiResponse } from '$lib/types/api';

export const load: PageLoad = async ({ params, fetch }) => {
	const paymentId = params.payment_id;
	
	const loadPayment = async () => {
		const res = await fetch(`/api/payment/detail/${paymentId}`);
		const result: ApiResponse<any> = await res.json();
		
		if (!res.ok) {
			return { payment: null, error: String((result as any).error || (result as any).message || 'Error loading payment') };
		}
		if (!(result as any).data) {
			return { payment: null, error: 'Payment not found' };
		}
		
		return { payment: (result as any).data };
	};

	return {
		paymentPromise: loadPayment()
	};
};
