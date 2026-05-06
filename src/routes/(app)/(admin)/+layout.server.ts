import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "../$types";

export const load : LayoutServerLoad = async ({locals}) => {
    if (locals.auth_data == null || locals.auth_data.role != "ADMIN") {
        return redirect(302, "/auth")
    }
}