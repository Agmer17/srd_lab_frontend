import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, fetch, depends }) => {
    depends('app:auth');

    if (!locals.auth_data) {
        return { user: null, accessToken: null };
    }

    const res = await fetch('/api/user/my-profile');

    if (!res.ok) {
        return { user: null, accessToken: null };
    }

    const data = await res.json();

    return {
        user: data.data ?? null,
        accessToken: locals.auth_data.access_token
    };
};