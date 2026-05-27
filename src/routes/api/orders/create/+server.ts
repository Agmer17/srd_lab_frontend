import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
    const token = locals.auth_data?.access_token;
    if (!token) {
        return json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const res = await fetch(`${PUBLIC_API_URL}/orders/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        return json(data, { status: res.status });
    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
};
