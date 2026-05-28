import type { RequestHandler } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

// Proxy static file requests (images) to the backend
export const GET: RequestHandler = async ({ params, fetch }) => {
	// PUBLIC_API_URL is like "http://localhost:6969/api"
	// We need the base: "http://localhost:6969"
	const baseUrl = PUBLIC_API_URL.replace(/\/api\/?$/, '');
	const targetUrl = `${baseUrl}/uploads/${params.path}`;

	try {
		const res = await fetch(targetUrl);

		if (!res.ok) {
			return new Response(null, { status: res.status });
		}

		const contentType = res.headers.get('Content-Type') ?? 'application/octet-stream';
		const buffer = await res.arrayBuffer();

		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=86400'
			}
		});
	} catch {
		return new Response(null, { status: 502 });
	}
};
