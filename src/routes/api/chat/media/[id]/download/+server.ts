import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch, cookies }) => {
    const token = cookies.get('access_token');
    const res = await fetch(
        `${PUBLIC_API_URL}/chat/private-media/${params.id}/download`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
        return new Response('Failed to download', {
            status: res.status
        });
    }

    // Ambil content-type dari backend
    const contentType =
        res.headers.get('content-type') ??
        'application/octet-stream';

    // Ambil filename dari backend
    const disposition =
        res.headers.get('content-disposition') ??
        'attachment';

    return new Response(res.body, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': disposition
        }
    });
};