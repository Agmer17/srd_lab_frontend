import type { PageLoad } from './$types';
import type { Product } from '$lib/types/product';
import type { Category } from '$lib/types/category';

interface ProductImage {
	id: string;
	product_id: string;
	image_url: string;
	is_primary: boolean;
	sort_order: number;
	created_at: string;
}

export const load: PageLoad = async ({ fetch, params }) => {
	const productId = params.id;

	const loadAll = async () => {
		try {
			const [productRes, categoriesRes, productCatsRes, imagesRes] = await Promise.all([
				fetch(`/api/products/id/${productId}`),
				fetch('/api/category/get-all'),
				fetch(`/api/products/categories/${productId}`),
				fetch(`/api/products/images/all/${productId}`)
			]);

			const productJson = await productRes.json();
			const categoriesJson = await categoriesRes.json();
			const productCatsJson = await productCatsRes.json();
			const imagesJson = await imagesRes.json();

			const product: Product | null = productJson?.data ?? null;
			const allCategories: Category[] = categoriesJson?.data ?? [];
			const assignedCategories: Category[] = productCatsJson?.data ?? [];
			const images: ProductImage[] = imagesJson?.data ?? [];

			if (!product) {
				return { product: null, allCategories, assignedCategories, images, error: 'Product not found' };
			}

			return { product, allCategories, assignedCategories, images, error: null };
		} catch {
			return { product: null, allCategories: [], assignedCategories: [], images: [], error: 'Failed to load product' };
		}
	};

	return {
		productId,
		dataPromise: loadAll()
	};
};
