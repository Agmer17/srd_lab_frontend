import type { PageLoad } from './$types';
import type { ApiResponse } from '$lib/types/api';
import type { Product } from '$lib/types/product';

export const load: PageLoad = async ({ fetch }) => {
	const loadProducts = async () => {
		try {
			const res = await fetch('/api/products');
			const result: ApiResponse<Product[]> = await res.json();

			if (!result.success) {
				return { products: [], error: String(result.error) };
			}
			if (!result.data) {
				return { products: [], error: 'No data returned' };
			}
			
			const featured = result.data
				.filter((p) => p.is_featured && p.status === 'active')
				.slice(0, 3);
			
			const productsWithImages = await Promise.all(
				featured.map(async (product) => {
					try {
						const imgRes = await fetch(`/api/products/images/${product.id}`);
						const imgResult = await imgRes.json();
						if (imgResult.success && imgResult.data && imgResult.data.length > 0) {
							const primary = imgResult.data.find((img: any) => img.is_primary) || imgResult.data[0];
							return { ...product, imageUrl: primary.image_url };
						}
					} catch (e) {
						// Fallback to no image if fetch fails
					}
					return { ...product, imageUrl: null };
				})
			);

			return { products: productsWithImages, error: null };
		} catch {
			return { products: [], error: 'Network error' };
		}
	};

	const loadReviews = async () => {
		try {
			const res = await fetch('/api/reviews/featured?limit=4');
			const result = await res.json();
			if (!result.data) {
				return { reviews: [], error: String(result.message || 'No data') };
			}
			return { reviews: result.data, error: null };
		} catch {
			return { reviews: [], error: 'Network error' };
		}
	};

	return {
		productsPromise: loadProducts(),
		reviewsPromise: loadReviews()
	};
};
