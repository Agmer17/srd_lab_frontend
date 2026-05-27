import { PUBLIC_API_URL } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ fetch, cookies, request, params }) => {
    const accessToken = cookies.get("access_token")
    const id = params.id
    try {
        const body = await request.json()
        const res = await fetch(`${PUBLIC_API_URL}/project/${id}/revision/add`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
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
                error: "Internal server error"
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}