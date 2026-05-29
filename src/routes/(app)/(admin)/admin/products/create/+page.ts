import type { PageLoad } from './$types';
import type { Category } from '$lib/types/category';

export const load: PageLoad = async ({ fetch }) => {
	const loadCategories = async () => {
		try {
			const res = await fetch('/api/category/get-all');
			const json = await res.json();
			const categories: Category[] = json?.data ?? [];
			return { categories, error: null };
		} catch {
			return { categories: [], error: 'Failed to load categories' };
		}
	};

	return {
		categoriesPromise: loadCategories()
	};
};
