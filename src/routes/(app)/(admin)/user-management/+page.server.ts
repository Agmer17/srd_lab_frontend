import type { ApiResponse } from "$lib/types/api";
import type { User } from "$lib/types/user";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, locals }) => {
    try {
        const res = await fetch('/api/user/all');
        const result: ApiResponse<User[]> = await res.json();

        if (!result.success) {
            return {
                users: [],
                error: result.error
            };
        }

        const users = result.data.filter(
            (user) => user.id !== locals.auth_data?.user_id
        );

        return {
            users,
            error: null
        };
    } catch {
        return {
            users: [],
            error: 'Network error'
        };
    }
};