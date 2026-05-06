import { redirect, type RequestHandler } from "@sveltejs/kit";
import { PUBLIC_API_URL } from "$env/static/public"

export const GET: RequestHandler = () => {
    return redirect(302, `${PUBLIC_API_URL}/auth/login/google`)
}