import type { RequestHandler } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const GET: RequestHandler = async ({ params, cookies, fetch }) => {
    const accessToken = cookies.get('access_token');

    try {
        const res = await fetch(`${PUBLIC_API_URL}/payment/detail/${params.payment_id}`, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
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
            JSON.stringify({ success: true, message: 'Payment detail retrieved', data: data?.data ?? null }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
