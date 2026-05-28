import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const GET: RequestHandler = async ({ fetch, cookies }) => {
	try {
		const apiUrl = env.PUBLIC_API_URL || 'http://localhost:6969/api';
		const accessToken = cookies.get('access_token');

		const res = await fetch(`${apiUrl}/payment/all`, {
			headers: {
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
			}
		});

		if (!res.ok) {
			return json({ success: false, error: 'Failed to fetch all payments', data: null }, { status: res.status });
		}

		const data = await res.json();
		return json(data);
	} catch (error) {
		console.error('Proxy error fetching all payments:', error);
		return json({ success: false, error: 'Internal Server Error', data: null }, { status: 500 });
	}
};
