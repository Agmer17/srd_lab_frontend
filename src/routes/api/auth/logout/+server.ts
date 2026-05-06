import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, cookies }) => {
    cookies.delete("access_token", {
        path: "/"
    })

    cookies.delete("refresh_token", {
        path: '/'
    });

    locals.auth_data = null

    return redirect(302, "/auth")
}