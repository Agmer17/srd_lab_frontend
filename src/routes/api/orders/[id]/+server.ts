import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
    const token = locals.auth_data?.access_token;
    if (!token) {
        return json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await fetch(`${PUBLIC_API_URL}/orders/details/${params.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        return json(data, { status: res.status });
    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
};
