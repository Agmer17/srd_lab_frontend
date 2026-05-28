import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
	const parentData = await parent();
	const isAdmin = parentData.user?.global_role === 'ADMIN';

	if (isAdmin) {
		const fetchAdminReviews = async () => {
			const productsRes = await fetch('/api/products');
			const productsResult = await productsRes.json();
			if (!productsResult.success) {
				return { error: productsResult.error || 'Failed to fetch products' };
			}
			const products = productsResult.data || [];
			
			const reviewPromises = products.map((p: any) => 
				fetch(`/api/reviews/product/${p.id}`).then(r => r.json())
			);
			
			const reviewResults = await Promise.all(reviewPromises);
			let allReviews: any[] = [];
			reviewResults.forEach((res, index) => {
				if (res.data) {
					// Add product info to the review for context in UI
					const prodReviews = res.data.map((r: any) => ({ ...r, productName: products[index].name, productId: products[index].id }));
					allReviews = [...allReviews, ...prodReviews];
				}
			});
			
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
