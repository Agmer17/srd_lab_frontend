import { PUBLIC_API_URL } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies, request, fetch }) => {
    const accessToken = cookies.get("access_token");
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
        const body = await request.json();
        const response = await fetch(`${PUBLIC_API_URL}/project-role/add`, {
            method: "POST",
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
};