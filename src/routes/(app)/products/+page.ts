import type { PageLoad } from './$types';
import type { ApiResponse } from '$lib/types/api';
import type { Product } from '$lib/types/product';
import type { Category } from '$lib/types/category';

export const load: PageLoad = async ({ fetch }) => {
	const loadProductsAndCategories = async () => {
		try {
			// Fetch products and categories in parallel
			const [productsRes, categoriesRes] = await Promise.all([
				fetch('/api/products'),
				fetch('/api/category/get-all')
			]);

			const productsResult: ApiResponse<Product[]> = await productsRes.json();
			const categoriesResult: ApiResponse<Category[]> = await categoriesRes.json();

			if (!productsResult.success) {
				return { products: [], categories: [], error: String(productsResult.error) };
			}
			if (!productsResult.data) {
				return { products: [], categories: [], error: 'Failed to load products' };
			}

			const products = productsResult.data;
			let categories: Category[] = [];

			if (categoriesResult.success && categoriesResult.data) {
				categories = categoriesResult.data;
			}

				const productsWithImagesAndCategories = await Promise.all(
				products.map(async (product) => {
					let imageUrl = null;
					let images: string[] = [];
					let productCategories: Category[] = [];

					try {
						// Fetch image and categories in parallel
						const [imgRes, catRes] = await Promise.all([
							fetch(`/api/products/images/${product.id}`),
							fetch(`/api/products/categories/${product.id}`)
						]);

						const imgResult = await imgRes.json();
						const catResult = await catRes.json();

						if (imgResult.success && imgResult.data && Array.isArray(imgResult.data)) {
							// Sort by sort_order
							const sortedImages = imgResult.data.sort((a: any, b: any) => a.sort_order - b.sort_order);
							if (sortedImages.length > 0) {
								imageUrl = sortedImages[0].image_url;
								images = sortedImages.map((img: any) => img.image_url);
							}
						}

						if (catResult.success && catResult.data) {
							productCategories = catResult.data;
						}
					} catch (e) {
						// Fallback to defaults on error
					}
					return { ...product, imageUrl, images, categories: productCategories };
				})
			);

			return { products: productsWithImagesAndCategories, categories, error: null };
		} catch {
			return { products: [], categories: [], error: 'Network error' };
		}
	};

	return {
		dataPromise: loadProductsAndCategories()
	};
};
