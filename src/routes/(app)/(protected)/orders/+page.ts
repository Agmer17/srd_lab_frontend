import type { ApiResponse } from "$lib/types/api";
import type { OrderListDTO } from "$lib/types/order";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
    const parentData = await parent()

    try {
        if (parentData.user.global_role === "ADMIN") {


            const res = await fetch("/api/orders/all")
            const apiResponse: ApiResponse<OrderListDTO[]> = await res.json()

            if (!apiResponse.success) {
                return { myOrders: [], allOrders: [] }
            }

            const currentUsersOrders = apiResponse.data.filter((o) => o.user_id == parentData.user.id)
            return { myOrders: currentUsersOrders, allOrders: apiResponse.data }

        } else {
            const res = await fetch("/api/orders/my-orders")
            const apiResponse: ApiResponse<OrderListDTO[]> = await res.json()

            if (!apiResponse.success) {
                return { myOrders: [], allOrders: [] }
            }

            return { myOrders: apiResponse.data, allOrders: apiResponse.data }
        }


    } catch (error) {
        return { myOrders: [], allOrders: [] }
    }
}