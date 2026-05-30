<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { toast, Toaster } from 'svelte-sonner';
	import { themeData } from '$lib/state/theme.svelte.js';
	import { parseError, formatCurrency } from '$lib/api_utils.js';
	import type { Product } from '$lib/types/product';
	import type { Category } from '$lib/types/category';
	import {
		RiArrowLeftLine,
		RiLoader4Line,
		RiCheckLine,
		RiStarLine,
		RiStarFill,
		RiUploadCloud2Line,
		RiDeleteBin7Line,
		RiErrorWarningLine,
		RiImageLine,
		RiCheckboxCircleLine,
		RiArrowUpLine,
		RiArrowDownLine,
		RiCloseLine
	} from 'remixicon-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';

	interface ProductImage {
		id: string;
		product_id: string;
		image_url: string;
		is_primary: boolean;
		sort_order: number;
		created_at: string;
	}

	interface UnifiedImage {
		localId: string;
		isExisting: boolean;
		imageId?: string;
		file?: File;
		url: string;
	}

	const { data } = $props();

	$effect(() => {
		data.dataPromise.then((res) => {
			if (res.product && !formInitialized) {
				initForm(res.product, res.assignedCategories, res.images);
			}
		});
	});

	// ─── Image URL helper ─────────────────────────────────────────────────────────
	function imgUrl(url: string | null | undefined): string {
		if (!url) return '';
		return url.startsWith('http') ? url : `${import.meta.env.PUBLIC_API_URL ?? 'http://localhost:6969'}${url}`;
	}

	// ─── Local form state ─────────────────────────────────────────────────────────
	// These will be initialized once data resolves (using $effect inside await)

	let form = $state({
		name: '',
		slug: '',
		description: '',
		price: '',
		status: 'active' as 'active' | 'not_available',
		is_featured: false
	});

	let selectedCategoryIds = $state<string[]>([]);
	let isUpdating = $state(false);
	let slugManuallyEdited = $state(false);
	let formInitialized = $state(false);

	// Images state
	let images = $state<UnifiedImage[]>([]);
	let deletedImageIds = $state<string[]>([]);
	let imagesLoaded = $state(false);

	// Delete image dialog
	let deleteImageOpen = $state(false);
	let targetImageId = $state<string | null>(null);

	// Upload state
	let fileInput: HTMLInputElement;

	function slugify(val: string) {
		return val
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}

	function toggleCategory(id: string) {
		if (selectedCategoryIds.includes(id)) {
			selectedCategoryIds = selectedCategoryIds.filter((c) => c !== id);
		} else {
			selectedCategoryIds = [...selectedCategoryIds, id];
		}
	}

	// ─── Initialize form from loaded data ─────────────────────────────────────────
	function initForm(product: Product, assignedCategories: Category[], loadedImages: ProductImage[]) {
		if (formInitialized) return;
		form = {
			name: product.name,
			slug: product.slug,
			description: product.description ?? '',
			price: String(product.price),
			status: (product.status as 'active' | 'not_available') ?? 'active',
			is_featured: product.is_featured ?? false
		};
		selectedCategoryIds = assignedCategories.map((c) => c.id);
		images = [...loadedImages].sort((a, b) => a.sort_order - b.sort_order).map(img => ({
			localId: img.id,
			isExisting: true,
			imageId: img.id,
			url: img.image_url
		}));
		deletedImageIds = [];
		imagesLoaded = true;
		formInitialized = true;
	}

	// ─── Save product form ────────────────────────────────────────────────────────
	async function handleSave(product: Product, originalAssignedCategories: Category[]) {
		if (!form.name.trim() || !form.slug.trim() || !form.price) {
			toast.error('Name, slug, and price are required.');
			return;
		}

		const price = parseFloat(form.price);
		if (isNaN(price) || price < 0) {
			toast.error('Please enter a valid price.');
			return;
		}

		isUpdating = true;

		try {
			// 1. Update product core fields
			const productPayload: Record<string, unknown> = {
				name: form.name.trim(),
				slug: form.slug.trim(),
				price,
				status: form.status,
				is_featured: form.is_featured,
				description: form.description.trim() || null
			};

			const productRes = await fetch(`/api/products/update/${product.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(productPayload)
			});

			const productJson = await productRes.json();
			if (!productJson.success) {
				toast.error(parseError(productJson.error), { duration: 3000 });
				return;
			}

			// 2. Diff categories
			const originalIds = new Set(originalAssignedCategories.map((c) => c.id));
			const newIds = new Set(selectedCategoryIds);

			const toAdd = selectedCategoryIds.filter((id) => !originalIds.has(id));
			const toRemove = [...originalIds].filter((id) => !newIds.has(id));

			const tasks: Promise<Response>[] = [];

			if (toAdd.length > 0) {
				tasks.push(
					fetch(`/api/products/categories/assign/${product.id}`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ category_ids: toAdd })
					})
				);
			}

			for (const catId of toRemove) {
				tasks.push(fetch(`/api/products/categories/remove/${product.id}/${catId}`, { method: 'DELETE' }));
			}

			// Delete queued images
			for (const id of deletedImageIds) {
				tasks.push(fetch(`/api/products/images/delete/${id}`, { method: 'DELETE' }));
			}

			await Promise.all(tasks);

			// Upload new images
			const newImages = images.filter(img => !img.isExisting);
			if (newImages.length > 0) {
				const formData = new FormData();
				for (const img of newImages) {
					formData.append('images', img.file!);
				}
				const uploadRes = await fetch(`/api/products/images/add/${product.id}`, {
					method: 'POST',
					body: formData
				});
				const uploadJson = await uploadRes.json();
				if (uploadJson.success && uploadJson.data) {
					const createdImages = uploadJson.data as ProductImage[];
					let cIdx = 0;
					for (const img of images) {
						if (!img.isExisting && createdImages[cIdx]) {
							img.imageId = createdImages[cIdx].id;
							img.isExisting = true;
							cIdx++;
						}
					}
				}
			}

			// Update image order
			const validOrderImages = images.filter(img => img.imageId);
			if (validOrderImages.length > 0) {
				const orderPayload = validOrderImages.map((img, i) => ({
					image_id: img.imageId,
					sort_order: i
				}));
				await fetch(`/api/products/images/order/${product.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(orderPayload)
				});
			}

			toast.success('Product updated successfully!', { duration: 2000 });
			await invalidateAll();
			formInitialized = false; // allow re-init
		} catch {
			toast.error('Network error. Please try again.');
		} finally {
			isUpdating = false;
		}
	}

	// ─── Image Upload ─────────────────────────────────────────────────────────────
	function onFilesSelected() {
		const files = fileInput?.files;
		if (!files) return;
		
		const newImages = Array.from(files).map((file, i) => ({
			localId: `new-${Date.now()}-${i}`,
			isExisting: false,
			file,
			url: URL.createObjectURL(file)
		}));
		
		images = [...images, ...newImages];
		fileInput.value = '';
		toast.info('Image(s) queued. Save changes to apply.', { duration: 2500 });
	}

	// ─── Delete Image ─────────────────────────────────────────────────────────────
	function openDeleteImage(localId: string) {
		targetImageId = localId;
		deleteImageOpen = true;
	}

	function confirmDeleteImage() {
		if (!targetImageId) return;
		
		const img = images.find(img => img.localId === targetImageId);
		if (img?.isExisting && img.imageId) {
			deletedImageIds.push(img.imageId);
		}
		
		images = images.filter(img => img.localId !== targetImageId);
		deleteImageOpen = false;
		targetImageId = null;
		
		if (img?.url && !img.isExisting) {
			URL.revokeObjectURL(img.url);
		}
	}

	// ─── Reorder Images ───────────────────────────────────────────────────────────
	function moveImage(index: number, direction: 'up' | 'down') {
		const newImages = [...images];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= newImages.length) return;
		[newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
		images = newImages;
	}
</script>

<Toaster richColors theme={themeData.value} position="top-right" />

{#await data.dataPromise}
	<!-- Loading state -->
	<div class="flex flex-1 min-h-0 flex-col gap-0 w-full overflow-y-auto">
		<header class="h-[52px] px-4 md:px-6 flex items-center gap-3 bg-background/85 backdrop-blur-md border-b sticky top-0 z-20 shrink-0">
			<Skeleton class="h-9 w-9 rounded-lg" />
			<Skeleton class="h-4 w-40" />
		</header>
		<div class="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-6">
			<Skeleton class="h-[300px] rounded-[14px]" />
			<Skeleton class="h-[200px] rounded-[14px]" />
		</div>
	</div>
{:then res}
	{#if res.error && !res.product}
		<div class="flex flex-col items-center justify-center h-full gap-4 p-12 text-center">
			<RiErrorWarningLine class="h-12 w-12 text-destructive opacity-60" />
			<h2 class="text-lg font-semibold text-foreground">Product not found</h2>
			<p class="text-sm text-muted-foreground">{res.error}</p>
			<button class="sprd-btn sprd-btn--default" onclick={() => goto('/admin/products')}>Back to Products</button>
		</div>
	{:else}
		{@const product = res.product!}
		{@const allCategories = res.allCategories}
		{@const assignedCategories = res.assignedCategories}

		<div class="flex flex-1 min-h-0 animate-in flex-col gap-0 duration-500 fade-in w-full overflow-y-auto">

			<!-- ── Sticky Header ── -->
			<header class="h-[52px] px-4 md:px-6 flex items-center justify-between bg-background/85 backdrop-blur-md border-b sticky top-0 z-20 shrink-0">
				<div class="flex items-center gap-3 min-w-0">
					<button
						class="w-9 h-9 shrink-0 rounded-lg bg-transparent border-none cursor-pointer text-muted-foreground flex items-center justify-center transition-all hover:bg-secondary/20 hover:text-foreground"
						onclick={() => history.back()}
					>
						<RiArrowLeftLine class="h-5 w-5" />
					</button>
					<div class="flex flex-col min-w-0">
						<span class="text-sm font-medium text-foreground tracking-tight truncate">{product.name}</span>
						<span class="text-[10px] text-muted-foreground leading-none mt-0.5">Edit Product</span>
					</div>
				</div>
				<button
					class="sprd-btn sprd-btn--default sprd-btn--sm flex items-center gap-1.5"
					onclick={() => handleSave(product, assignedCategories)}
					disabled={isUpdating}
				>
					{#if isUpdating}
						<RiLoader4Line class="h-4 w-4 animate-spin" />
					{:else}
						<RiCheckLine class="h-4 w-4" />
					{/if}
					{isUpdating ? 'Saving...' : 'Save Changes'}
				</button>
			</header>

			<!-- ── Content ── -->
			<div class="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-6 pb-16">

				<!-- ── Section A: Product Form ── -->
				<div class="bg-card rounded-[14px] p-4 md:p-6" style="box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08), var(--shadow-xs);">
					<h2 class="text-sm font-semibold tracking-tight mb-5 flex items-center gap-2">
						<span class="w-1 h-4 rounded-full bg-primary inline-block"></span>
						Product Details
					</h2>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
						<div class="col-span-2 flex flex-col gap-1.5">
							<label for="edit-name" class="text-xs font-medium text-foreground">Product Name <span class="text-destructive">*</span></label>
							<Input id="edit-name" bind:value={form.name} class="h-9 text-sm" oninput={() => { if (!slugManuallyEdited) form.slug = slugify(form.name); }} />
						</div>

						<div class="col-span-2 flex flex-col gap-1.5">
							<label for="edit-slug" class="text-xs font-medium text-foreground">Slug <span class="text-destructive">*</span></label>
							<Input id="edit-slug" bind:value={form.slug} class="h-9 text-sm font-mono" oninput={() => (slugManuallyEdited = true)} />
						</div>

						<div class="col-span-2 flex flex-col gap-1.5">
							<label for="edit-desc" class="text-xs font-medium text-foreground">Description</label>
							<textarea
								id="edit-desc"
								bind:value={form.description}
								rows={4}
								class="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
							></textarea>
						</div>

						<div class="flex flex-col gap-1.5">
							<label for="edit-price" class="text-xs font-medium text-foreground">Price (IDR) <span class="text-destructive">*</span></label>
							<div class="relative">
								<span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">Rp</span>
								<Input id="edit-price" type="number" bind:value={form.price} min="0" class="h-9 pl-9 text-sm font-mono" />
							</div>
						</div>

						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-medium text-foreground">Status</label>
							<div class="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
								{#each [{ val: 'active', label: 'Active' }, { val: 'not_available', label: 'Inactive' }] as opt}
									<button
										class="sm:flex-1 h-10 sm:h-9 rounded-md border text-sm font-medium transition-all cursor-pointer flex items-center justify-center {form.status === opt.val
											? 'bg-secondary text-secondary-foreground border-secondary shadow-sm'
											: 'bg-background text-muted-foreground border-border hover:border-secondary/50 hover:bg-secondary/5'}"
										onclick={() => (form.status = opt.val as 'active' | 'not_available')}
									>{opt.label}</button>
								{/each}
							</div>
						</div>
						<div class="col-span-2 flex items-center justify-between p-3.5 rounded-lg border bg-card/50">
							<div class="flex flex-col gap-0.5">
								<label class="text-xs font-semibold text-foreground">Featured Product</label>
								<p class="text-[10px] text-muted-foreground">Highlight this product prominently.</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={form.is_featured}
								class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {form.is_featured ? 'bg-primary' : 'bg-input'}"
								onclick={() => (form.is_featured = !form.is_featured)}
							>
								<span class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform {form.is_featured ? 'translate-x-4' : 'translate-x-0'}"></span>
							</button>
						</div>
					</div>
				</div>

				<!-- ── Section A2: Categories ── -->
				<div class="bg-card rounded-[14px] p-4 md:p-6" style="box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08), var(--shadow-xs);">
					<h2 class="text-sm font-semibold tracking-tight mb-1 flex items-center gap-2">
						<span class="w-1 h-4 rounded-full bg-primary inline-block"></span>
						Categories
					</h2>
					<p class="text-xs text-muted-foreground mb-4">Changes will be applied when you save.</p>

					{#if allCategories.length === 0}
						<p class="text-sm text-muted-foreground italic">No categories available.</p>
					{:else}
						<div class="flex flex-wrap gap-2">
							{#each allCategories as cat}
								{@const selected = selectedCategoryIds.includes(cat.id)}
								<button
									class="flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-medium border transition-all cursor-pointer {selected
										? 'bg-primary text-primary-foreground border-transparent'
										: 'bg-background text-muted-foreground border-border hover:border-secondary/50'}"
									onclick={() => toggleCategory(cat.id)}
								>
									{#if selected}<RiCheckLine class="h-3 w-3" />{/if}
									{cat.name}
								</button>
							{/each}
						</div>
						{#if selectedCategoryIds.length > 0}
							<p class="text-[11px] text-muted-foreground mt-2">{selectedCategoryIds.length} selected</p>
						{/if}
					{/if}
				</div>

				<!-- ── Section B: Image Management ── -->
				<div class="bg-card rounded-[14px] p-4 md:p-6" style="box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08), var(--shadow-xs);">
					<div class="flex items-center justify-between mb-5">
						<h2 class="text-sm font-semibold tracking-tight flex items-center gap-2">
							<span class="w-1 h-4 rounded-full bg-primary inline-block"></span>
							Product Images
						</h2>
					</div>

					<!-- Image Grid -->
					{#if images.length === 0}
						<div class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-muted-foreground mb-5" style="border-color: oklch(0.6 0 0 / .4);">
							<RiImageLine class="h-8 w-8 opacity-40 mb-1" />
							<p class="text-sm font-medium text-foreground">No images yet</p>
							<p class="text-xs">Upload images below to get started.</p>
						</div>
					{:else}
						<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
							{#each images as img, i (img.localId)}
								<div class="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-square">
									<img
										src={img.isExisting ? imgUrl(img.url) : img.url}
										alt="Product image {i + 1}"
										class="w-full h-full object-cover"
									/>
									<!-- Primary badge -->
									{#if i === 0}
										<div class="absolute top-2 left-2">
											<span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
												<RiCheckboxCircleLine class="h-3 w-3" /> Primary
											</span>
										</div>
									{/if}
									<!-- Sort order badge -->
									<div class="absolute top-2 right-2 h-5 w-5 rounded-full bg-black/50 text-white text-[10px] font-bold flex items-center justify-center">
										{i + 1}
									</div>
									<!-- Hover actions -->
									<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
										<div class="flex gap-1">
											<button
												class="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
												onclick={() => moveImage(i, 'up')}
												disabled={i === 0}
												title="Move up"
											>
												<RiArrowUpLine class="h-4 w-4" />
											</button>
											<button
												class="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
												onclick={() => moveImage(i, 'down')}
												disabled={i === images.length - 1}
												title="Move down"
											>
												<RiArrowDownLine class="h-4 w-4" />
											</button>
										</div>
										<button
											class="h-8 w-8 rounded-lg bg-destructive/80 hover:bg-destructive text-white flex items-center justify-center transition-colors border-none cursor-pointer"
											onclick={() => openDeleteImage(img.localId)}
											title="Delete image"
										>
											<RiDeleteBin7Line class="h-4 w-4" />
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Upload Area -->
					<div class="rounded-xl border border-dashed p-4 md:p-5 transition-colors hover:border-primary/40" style="border-color: oklch(0.6 0 0 / .4);">
						<div class="flex flex-col sm:flex-row sm:items-center gap-4">
							<div class="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style="background: var(--primary)/10;">
								<RiUploadCloud2Line class="h-6 w-6" style="color: var(--primary);" />
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-foreground">Upload Images</p>
								<p class="text-xs text-muted-foreground">Select multiple files at once. Supported: JPG, PNG, WebP.</p>
							</div>
							<div class="flex gap-2 shrink-0 sm:w-auto w-full justify-end">
								<label
									class="sprd-btn sprd-btn--outline sprd-btn--sm cursor-pointer"
									for="img-upload"
								>
									Browse
								</label>
							</div>
						</div>
						<input
							id="img-upload"
							type="file"
							accept="image/*"
							multiple
							class="sr-only"
							bind:this={fileInput}
							onchange={onFilesSelected}
						/>
					</div>
				</div>

			</div>
		</div>

		<!-- ─── Delete Image AlertDialog ─────────────────────────────────────────── -->
		<AlertDialog bind:open={deleteImageOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete image?</AlertDialogTitle>
					<AlertDialogDescription>
						This image will be permanently removed from the product.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onclick={() => (deleteImageOpen = false)}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						class="bg-destructive text-white hover:bg-destructive/90 flex items-center gap-2"
						onclick={confirmDeleteImage}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	{/if}
{:catch}
	<div class="flex flex-col items-center justify-center h-full gap-3 p-12">
		<RiErrorWarningLine class="h-10 w-10 text-destructive opacity-60" />
		<p class="text-sm text-muted-foreground">Failed to connect to server.</p>
	</div>
{/await}

<style>
	.sprd-btn {
		display: inline-flex; align-items: center; justify-content: center; gap: 6px;
		height: 36px; padding: 0 14px; border-radius: 6.5px;
		font-family: inherit; font-size: 14px; font-weight: 500; letter-spacing: -0.01em;
		border: 1px solid transparent; cursor: pointer; transition: all 0.15s; white-space: nowrap;
	}
	.sprd-btn:active:not(:disabled) { transform: translateY(1px); }
	.sprd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
	.sprd-btn--default { background: var(--primary); color: var(--primary-foreground); }
	.sprd-btn--default:hover:not(:disabled) { background: oklch(0.86 0.17 91 / 0.82); }
	.sprd-btn--outline {
		background: var(--background); color: var(--foreground);
		border-color: var(--border); box-shadow: var(--shadow-xs);
	}
	.sprd-btn--outline:hover:not(:disabled) { background: oklch(0.94 0.003 248); }
	.sprd-btn--sm { height: 30px; padding: 0 10px; font-size: 13px; }
</style>
