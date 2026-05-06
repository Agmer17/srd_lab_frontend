
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals, fetch, depends }) => {
    depends('app:auth');
    if (!locals.auth_data) {
        return { user: null };
    }

    const res = await fetch('/api/user/my-profile');
    const data = await res.json();

    return {
        user: data.data
    };
};