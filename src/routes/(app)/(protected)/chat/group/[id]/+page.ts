import { PUBLIC_API_URL } from "$env/static/public";
import type { PageLoad } from "./$types";
import type { ApiResponse } from "$lib/types/api";
import type { ChatDataDto } from "$lib/types/chat";

export const load: PageLoad = async ({ fetch, params }) => {
    const loadChat = async () => {
        try {

            const id = params.id

            const res = await fetch(`/api/chat/group/${id}`)
            const result = await res.json()
            return {
                chats: result.data, error: null
            }

        } catch (error) {
            return {
                chats: [], error: "network error while trying to get message data"
            }
        }
    }

    return {
        chatDataPromise: loadChat()
    }
}