import type { RequestHandler } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const POST: RequestHandler = async ({ params, request, cookies, fetch }) => {
    const accessToken = cookies.get('access_token');

    try {
        const body = await request.json();
        const res = await fetch(`${PUBLIC_API_URL}/payment/create/${params.order_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accessToken
            },
            body: JSON.stringify(body)
        });

        let data: any;
        try {
            data = await res.json();
        } catch {
            data = { error: await res.text() };
        }

        if (!res.ok) {
            return new Response(
                JSON.stringify({ success: false, error: data.error ?? data }),
                { status: res.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify(data),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
