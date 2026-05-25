import type { ApiResponse } from "$lib/types/api";
import type { User } from "$lib/types/user";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
    const userId = params.id
    try {
        if (locals.auth_data?.role == "ADMIN") {
            const res = await fetch("/api/user/all")
            const apiResponse: ApiResponse<User[]> = await res.json()

            if (!apiResponse.success) {
                return { user: null, error: apiResponse.error }
            }


            const newChatUser = apiResponse.data.find(
                (u) => u.id === userId
            );

            if (!newChatUser) {
                return { user: null, error: "no users found!" }
            }

            return { user: newChatUser, error: null }


        } else {
            const res = await fetch("/api/user/all/admin")
            const apiResponse: ApiResponse<User[]> = await res.json()

            if (!apiResponse.success) {
                return { user: null, error: apiResponse.error }
            }


            const newChatUser = apiResponse.data.find(
                (u) => u.id === userId
            );

            if (!newChatUser) {
                return { user: null, error: "no users found!" }
            }

            return { user: newChatUser, error: null }
        }
    } catch (error) {
        return { user: null, error: "network error" }
    }
}