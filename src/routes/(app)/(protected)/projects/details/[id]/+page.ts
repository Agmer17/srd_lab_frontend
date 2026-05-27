import type { ApiResponse } from "$lib/types/api";
import type { Project } from "$lib/types/projects";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {

    const id = params.id
    try {
        const res = await fetch("/api/projects/details/" + id)

        const apiResponse: ApiResponse<Project> = await res.json()

        if (!apiResponse.success) {
            return { projectDetails: null }
        }

        return { projectDetails: apiResponse.data }

    } catch (error) {
        return { projectDetails: null }
    }

}