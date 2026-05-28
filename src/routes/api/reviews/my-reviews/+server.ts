import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const GET: RequestHandler = async ({ fetch, cookies }) => {
	try {
		const apiUrl = env.PUBLIC_API_URL || 'http://localhost:6969/api';
		const accessToken = cookies.get('access_token');

		// The backend doesn't have this endpoint yet, but we'll fetch it anyway
		// If it 404s, we return an empty array
		const res = await fetch(`${apiUrl}/reviews/my-reviews`, {
			headers: {
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
			}
		});

		if (res.status === 404) {
			return json({ success: true, message: 'No reviews found (mock fallback)', data: [] });
		}

		if (!res.ok) {
			const errorText = await res.text();
			return json({ success: false, error: errorText, data: [] }, { status: res.status });
		}

		const data = await res.json();
		return json(data);
	} catch (error) {
		console.error('Proxy error fetching my-reviews:', error);
		// Return empty array on failure as requested to not break the UI when the endpoint is missing
		return json({ success: true, message: 'Internal Server Error fallback', data: [] });
	}
};
