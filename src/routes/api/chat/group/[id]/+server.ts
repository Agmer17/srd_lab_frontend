import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch, cookies }) => {
    try {
        const id = params.id;
        const accessToken = cookies.get('access_token');

        if (!accessToken) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'your session is expired'
                }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const res = await fetch(`${PUBLIC_API_URL}/chat/group/${id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
        })

        const data = await res.json();

        return new Response(JSON.stringify(data), {
            status: res.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: 'internal server error'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};