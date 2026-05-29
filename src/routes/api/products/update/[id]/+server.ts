import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ cookies, fetch, params, request }) => {
	const accessToken = cookies.get('access_token');
	const body = await request.text();

	try {
		const res = await fetch(`${PUBLIC_API_URL}/product/update/${params.id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			},
			body
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
