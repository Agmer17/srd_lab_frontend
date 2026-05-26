import type { RequestHandler } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

// Public endpoint to get product details by slug
export const GET: RequestHandler = async ({ fetch, params }) => {
	const slug = params.slug;
	const targetUrl = `${PUBLIC_API_URL}/product/details/${slug}`;

	try {
		const res = await fetch(targetUrl, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});

		const raw = await res.text();
		let data: unknown;
		try {
			data = raw ? JSON.parse(raw) : null;
		} catch {
			data = { error: raw || 'Invalid JSON response' };
		}

		if (!res.ok) {
			return new Response(
				JSON.stringify({
					success: false,
					error: (data as Record<string, unknown>)?.error ?? 'Unknown error'
				}),
				{ status: res.status, headers: { 'Content-Type': 'application/json' } }
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				data: (data as Record<string, unknown>)?.data ?? data ?? null
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch {
		return new Response(
			JSON.stringify({ success: false, error: 'Internal server error' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
