import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
	const parentData = await parent();
	const isAdmin = parentData.user?.global_role === 'ADMIN';

	if (isAdmin) {
		const fetchAdminReviews = async () => {
			const res = await fetch('/api/reviews/admin/all');
			const result = await res.json();
			
			if (!result.success && !result.data) {
				return { error: result.error || result.message || 'Failed to fetch reviews' };
			}
			
			// The backend now returns reviews with populated User and Product
			const allReviews = (result.data || []).map((r: any) => ({
				...r,
				productName: r.Product?.name || 'Unknown Product',
				productId: r.Product?.id,
				user_name: r.User?.full_name || 'Anonymous'
			}));
			
			return { reviews: allReviews };
		};
		
		return {
			isAdmin,
			reviewsPromise: fetchAdminReviews()
		};
	} else {
		const fetchUserReviews = async () => {
			const [ordersRes, reviewsRes] = await Promise.all([
				fetch('/api/orders/my-orders'),
				fetch('/api/reviews/my-reviews')
			]);
			
			const ordersResult = await ordersRes.json();
			const reviewsResult = await reviewsRes.json();
			
			if (!ordersResult.success && !ordersResult.data) {
				return { error: ordersResult.error || ordersResult.message || 'Failed to fetch orders' };
			}
			
			// Both our API and the proxy could return data in result.data
			const orders = ordersResult.data || [];
			const reviews = reviewsResult.data || [];
			
			const completedOrders = orders.filter((o: any) => o.status?.toLowerCase() === 'completed');
			
			return {
				allOrders: orders,
				completedOrders,
				myReviews: reviews
			};
		};
		
		return {
			isAdmin,
			reviewsPromise: fetchUserReviews()
		};
	}
};
