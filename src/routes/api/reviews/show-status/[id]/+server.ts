import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const PATCH: RequestHandler = async ({ fetch, cookies, params, request }) => {
	try {
		const apiUrl = env.PUBLIC_API_URL || 'http://localhost:6969/api';
		const accessToken = cookies.get('access_token');
		const body = await request.json();

		const res = await fetch(`${apiUrl}/reviews/show-status/${params.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
			},
			body: JSON.stringify(body)
		});

		const data = await res.json();
		
		if (!res.ok) {
			return json({ success: false, error: data.message || data.error || 'Failed to update review status' }, { status: res.status });
		}

		return json(data);
	} catch (error) {
		console.error('Proxy error updating review status:', error);
		return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
	}
};
