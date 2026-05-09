import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { PUBLIC_API_URL } from "$env/static/public";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {

    const accessToken = cookies.get("access_token")
    if (!accessToken) {
        return {
            latest_chat: null
        }
    }

    const response = await fetch(`${PUBLIC_API_URL}/chat/latest`, {
        headers: {
            Authorization: "Bearer " + accessToken
        }
    })

    if (!response.ok) {
        return {
            latest_chat: null
        }
    }

    const resData = await response.json()

    return {
        latest_chat: resData.data ?? null
    }
}