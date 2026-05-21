import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, fetch, depends }) => {
    depends('app:auth');

    if (!locals.auth_data) {
        return { user: null, accessToken: null, joinRoom: [] };
    }

    const res = await fetch('/api/user/my-profile');

    if (!res.ok) {
        return { user: null, accessToken: null, joinRoom: [] };
    }

    const data = await res.json();

    const resRoom = await fetch("/api/chat/to-join")
    if (!resRoom.ok) {
        return {
            user: data.data,
            accessToken: locals.auth_data.access_token,
            joinRoom: []
        };
    }

    const roomData = await resRoom.json()

    return {
        user: data.data ?? null,
        accessToken: locals.auth_data.access_token,
        joinRoom: roomData.data
    };
};