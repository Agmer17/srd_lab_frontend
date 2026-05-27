import { PUBLIC_API_URL } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ fetch, cookies, request, params }) => {
    const accessToken = cookies.get("access_token");

    // Mengambil project ID dan revision ID dari params
    const projectId = params.id;
    const revisionId = params.revision_id;

    try {
        const body = await request.json();

        // Memanggil API backend Go (method PATCH sesuai routermu)
        const res = await fetch(`${PUBLIC_API_URL}/project/${projectId}/revision/update/${revisionId}`, {
            method: "PATCH",
            headers: {
                Authorization: "Bearer " + accessToken,
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