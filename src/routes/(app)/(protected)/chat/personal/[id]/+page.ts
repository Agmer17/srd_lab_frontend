import type { LatestChatDto } from "$lib/types/chat";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params, parent }) => {
    const parentData = await parent();

    const currentRoom: LatestChatDto = parentData.latest_chat?.find(
        (chat: LatestChatDto) => chat.chatroom_id === params.id
    );

    const loadChat = async () => {
        try {

            const id = params.id

            const res = await fetch(`/api/chat/personal/${id}`)
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
        roomData: currentRoom,
        chatDataPromise: loadChat()
    }
}