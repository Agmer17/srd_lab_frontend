import type { ApiResponse } from "$lib/types/api";
import type { Project } from "$lib/types/projects";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, parent }) => {
    const parentData = await parent()

    try {

        if (parentData.user.global_role == "ADMIN") {
            const res = await fetch("/api/projects/all")
            const apiResponse: ApiResponse<Project[]> = await res.json()

            if (!apiResponse.success) {
                return { projects: [] }
            } else {
                return { projects: apiResponse.data }
            }

        } else {
            const res = await fetch("/api/projects/my-projects")
            const apiResponse: ApiResponse<Project[]> = await res.json()
            if (!apiResponse.success) {
                return { projects: [] }
            } else {
                return { projects: apiResponse.data }
            }
        }

    } catch (error) {
        return { projects: [] }
    }
}