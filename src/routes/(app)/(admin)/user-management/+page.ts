import type { ApiResponse } from '$lib/types/api';
import type { User } from '$lib/types/user';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
    const loadUsers = async () => {
        try {
            const { accessToken, user } = await parent(); // user dari parent (current login)
            const res = await fetch('/api/user/all');

            const result: ApiResponse<User[]> = await res.json();

            if (!result.success) {
                return { users: [], error: result.error };
            }

            // GANTI BAGIAN INI: gunakan 'u' agar tidak bentrok dengan 'user' dari parent
            const users = result.data.filter(
                (u) => u.id !== user?.id
            );

            return { users, error: null };
        } catch {
            return { users: [], error: 'Network error' };
        }
    };

    return {
        usersPromise: loadUsers()
    };
};