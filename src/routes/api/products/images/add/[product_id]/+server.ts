import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

// POST: upload image(s) to a product (multipart form-data)
export const POST: RequestHandler = async ({ cookies, fetch, params, request }) => {
	const accessToken = cookies.get('access_token');

	try {
		const formData = await request.formData();

		const res = await fetch(`${PUBLIC_API_URL}/product/images/add/${params.product_id}`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`
				// Do NOT set Content-Type — let fetch set it with the proper boundary
			},
			body: formData
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			return new Response(
				JSON.stringify({ success: false, error: data?.message ?? data?.error ?? 'Unknown error' }),
				{ status: res.status, headers: { 'Content-Type': 'application/json' } }
			);
		}

		return new Response(JSON.stringify({ success: true, data: data?.data ?? data }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch {
		return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
