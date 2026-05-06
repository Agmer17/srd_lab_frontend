import type { User } from "$lib/types/user";

interface CurrentUserData {
    data: User | null
}

export const currentUserStore = $state<CurrentUserData>({ data: null })