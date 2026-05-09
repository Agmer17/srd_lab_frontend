import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, cookies, fetch }) => {

    const accessToken = cookies.get("access_token")
    const res = await fetch(
        `${PUBLIC_API_URL}/chat/private-media/${params.id}`,
        {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        }
    );

    return new Response(res.body, {
        status: res.status,
        headers: {
            'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream'
        }
    });
};