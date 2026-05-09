import { PUBLIC_API_URL } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies }) => {

    const accessToken = cookies.get("access_token")
    if (!accessToken) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "you need to login to access this feature"
            }),
            {
                status: 401,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
    try {
        const res = await fetch(`${PUBLIC_API_URL}/chat/latest`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
        })

        let data: any;
        try {
            data = await res.json();
        } catch {
            data = { error: await res.text() };
        }

        if (!res.ok) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: data.error ?? data
                }),
                {
                    status: res.status,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }


        return new Response(
            JSON.stringify({
                success: true,
                message: "successfully getting chat data",
                data: data?.data ?? null
            }),
            {
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "Internal server error"
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}