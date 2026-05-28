import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const GET: RequestHandler = async ({ fetch, params }) => {
	try {
		const apiUrl = env.PUBLIC_API_URL || 'http://localhost:6969/api';
		const res = await fetch(`${apiUrl}/reviews/product/${params.product_id}`);

		if (!res.ok) {
			console.error('Failed to fetch product reviews:', res.status, res.statusText);
			return json({ success: false, error: 'Failed to fetch product reviews', data: null }, { status: res.status });
		}

		const data = await res.json();
		return json(data);
	} catch (error) {
		console.error('Proxy error fetching product reviews:', error);
		return json({ success: false, error: 'Internal Server Error', data: null }, { status: 500 });
	}
};
