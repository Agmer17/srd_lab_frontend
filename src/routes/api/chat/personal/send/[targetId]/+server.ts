import type { RequestHandler } from "./$types";
import { PUBLIC_API_URL } from '$env/static/public';


export const POST: RequestHandler = async ({ params, fetch, request, cookies }) => {

    try {
        const targetId = params.targetId
        const formData = await request.formData()
        const accessToken = cookies.get('access_token');

        const res = await fetch(`${PUBLIC_API_URL}/chat/personal/${targetId}/send`, {
            headers: {
                Authorization: "Bearer " + accessToken
            },
            method: "POST",
            body: formData,

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