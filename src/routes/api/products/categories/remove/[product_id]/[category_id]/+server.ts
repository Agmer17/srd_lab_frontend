import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

// DELETE: remove one specific category from a product
export const DELETE: RequestHandler = async ({ cookies, fetch, params }) => {
	const accessToken = cookies.get('access_token');

	try {
		const res = await fetch(
			`${PUBLIC_API_URL}/product/categories/remove/${params.product_id}/${params.category_id}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}
		);

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			return new Response(
				JSON.stringify({ success: false, error: data?.message ?? data?.error ?? 'Unknown error' }),
				{ status: res.status, headers: { 'Content-Type': 'application/json' } }
			);
		}

		return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch {
		return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
