import type { PageLoad } from './$types';
import type { Product } from '$lib/types/product';
import type { Category } from '$lib/types/category';

export const load: PageLoad = async ({ fetch }) => {
	const loadData = async () => {
		try {
			const [productsRes, categoriesRes] = await Promise.all([
				fetch('/api/products'),
				fetch('/api/category/get-all')
			]);

			const productsJson = await productsRes.json();
			const categoriesJson = await categoriesRes.json();

			const products: Product[] = productsJson?.data ?? [];
			const categories: Category[] = categoriesJson?.data ?? [];

			return { products, categories, error: null };
		} catch {
			return { products: [], categories: [], error: 'Failed to load data' };
		}
	};

	return {
		dataPromise: loadData()
	};
};
