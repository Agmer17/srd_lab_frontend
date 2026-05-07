import { PUBLIC_API_URL } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ cookies, params, request }) => {
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

    const id = params.id

    try {
        const body = await request.json();
        const response = await fetch(`${PUBLIC_API_URL}/user/update/${id}`, {
            method: "PATCH",
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        let data: any;

        try {
            data = await response.json();
        } catch {
            data = { error: await response.text() };
        }

        if (!response.ok) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: data.error ?? data
                }),
                {
                    status: response.status,
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