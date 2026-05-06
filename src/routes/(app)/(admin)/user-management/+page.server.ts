import type { ApiResponse } from "$lib/types/api";
import type { User } from "$lib/types/user";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const res = await fetch('/api/user/all');
        const result: ApiResponse<User[]> = await res.json();

        if (!result.success) {
            return {
                users: [],
                error: result.error
            };
        }

        return {
            users: result.data,
            error: null
        };
    } catch {
        return {
            users: [],
            error: 'Network error'
        };
    }
};