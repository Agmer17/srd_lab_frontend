import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const GET: RequestHandler = async ({ fetch, cookies }) => {
	try {
		const apiUrl = env.PUBLIC_API_URL || 'http://localhost:6969/api';
		const accessToken = cookies.get('access_token');

		const res = await fetch(`${apiUrl}/reviews/admin/all`, {
			headers: {
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
			}
		});

		if (!res.ok) {
			const errorText = await res.text();
			return json({ success: false, error: errorText, data: [] }, { status: res.status });
		}

		const data = await res.json();
		return json(data);
	} catch (error) {
		console.error('Proxy error fetching admin reviews:', error);
		return json({ success: false, message: 'Internal Server Error', data: [] }, { status: 500 });
	}
};
