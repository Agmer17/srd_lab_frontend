import { PUBLIC_API_URL } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ fetch, cookies, params, request }) => {
    const projectId = params.id;
    const accessToken = cookies.get("access_token");

    if (!accessToken) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "Unauthorized"
            }),
            {
                status: 401,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    try {
        // Ambil data dari body request SvelteKit
        const body = await request.json();

        const res = await fetch(`${PUBLIC_API_URL}/project/${projectId}/members/add`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + accessToken, // Typo "Authorzation" saya perbaiki di sini ya
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

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
};