import { PUBLIC_API_URL } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ cookies, params }) => {

    const id = params.id
    const accessToken = cookies.get("access_token")

    if (!accessToken) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "you need to login to access this api"
            }),
            {
                status: 401,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    try {
        const res = await fetch(`${PUBLIC_API_URL}/user/delete/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + accessToken
            }
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
                message: data.message,
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
                error: error
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}