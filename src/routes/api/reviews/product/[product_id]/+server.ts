import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const GET: RequestHandler = async ({ fetch, cookies, params }) => {
	try {
		const apiUrl = env.PUBLIC_API_URL || 'http://localhost:6969/api';
		const accessToken = cookies.get('access_token');

		const res = await fetch(`${apiUrl}/reviews/product/${params.product_id}`, {
			headers: {
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
			}
		});

		if (!res.ok) {
			let errorMessage = 'Failed to fetch product reviews';
			try {
				const errData = await res.json();
				errorMessage = errData.message || errData.error || errorMessage;
			} catch (e) {}
			return json({ success: false, error: errorMessage, data: null }, { status: res.status });
		}

		const data = await res.json();
		return json(data);
	} catch (error) {
		console.error('Proxy error fetching product reviews:', error);
		return json({ success: false, error: 'Internal Server Error', data: null }, { status: 500 });
	}
};
