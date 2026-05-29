import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

// GET: fetch all images for a product
export const GET: RequestHandler = async ({ fetch, params }) => {
	try {
		const res = await fetch(`${PUBLIC_API_URL}/product/images/all/${params.product_id}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			return new Response(
				JSON.stringify({ success: false, error: data?.message ?? data?.error ?? 'Unknown error' }),
				{ status: res.status, headers: { 'Content-Type': 'application/json' } }
			);
		}

		return new Response(JSON.stringify({ success: true, data: data?.data ?? [] }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch {
		return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
