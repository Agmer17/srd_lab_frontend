import { PUBLIC_API_URL } from "$env/static/public";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ cookies, fetch, request, params }) => {
    const projectId = params.id
    const progressId = params.progress_id
    const accessToken = cookies.get("access_token")
    const body = await request.json()
    try {


        const res = await fetch(`${PUBLIC_API_URL}/project/${projectId}/progress/update/${progressId}`, {
            method: "PATCH",
            headers: {
                Authorization: "Bearer " + accessToken
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