<script lang="ts">
	import {
		RiSearchLine,
		RiAddLine,
		RiEditLine,
		RiDeleteBin7Line,
		RiPriceTag3Line,
		RiImageLine,
		RiCheckboxCircleLine,
		RiCloseCircleLine,
		RiStarFill,
		RiMore2Line,
		RiLoader4Line,
		RiShoppingBagLine,
		RiPriceTagLine,
		RiErrorWarningLine,
		RiCloseLine,
		RiCheckLine,
		RiArrowLeftLine
	} from 'remixicon-svelte';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
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
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { toast, Toaster } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { themeData } from '$lib/state/theme.svelte.js';
	import { formatCurrency, parseError } from '$lib/api_utils.js';
	import type { Product } from '$lib/types/product';
	import type { Category } from '$lib/types/category';

	// ─── Props ────────────────────────────────────────────────────────────────────
	const { data } = $props();

	// ─── Active Tab ───────────────────────────────────────────────────────────────
	type TabId = 'products' | 'categories';
	let activeTab = $state<TabId>('products');

	// ─── Search ──────────────────────────────────────────────────────────────────
	let searchProducts = $state('');
	let searchCategories = $state('');

	function filterProducts(products: Product[]) {
		if (!searchProducts.trim()) return products;
		const q = searchProducts.toLowerCase();
		return products.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.slug.toLowerCase().includes(q) ||
				p.status?.toLowerCase().includes(q)
		);
	}

	function filterCategories(categories: Category[]) {
		if (!searchCategories.trim()) return categories;
		const q = searchCategories.toLowerCase();
		return categories.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.slug.toLowerCase().includes(q) ||
				(c.desc ?? '').toLowerCase().includes(q)
		);
	}

	// ─── Delete Product ───────────────────────────────────────────────────────────
	let deleteProductOpen = $state(false);
	let targetProduct = $state<Product | null>(null);
	let isDeletingProduct = $state(false);

	function openDeleteProduct(p: Product, e?: MouseEvent) {
		e?.stopPropagation();
		targetProduct = p;
		deleteProductOpen = true;
	}

	async function confirmDeleteProduct() {
		if (!targetProduct) return;
		isDeletingProduct = true;
		try {
			const res = await fetch(`/api/products/delete/${targetProduct.id}`, { method: 'DELETE' });
			const json = await res.json();
			if (!json.success) {
				toast.error(parseError(json.error), { duration: 2000 });
				return;
			}
			toast.success(`"${targetProduct.name}" deleted`, { duration: 2000 });
			deleteProductOpen = false;
			targetProduct = null;
			await invalidateAll();
		} catch {
			toast.error('Network error', { duration: 2000 });
		} finally {
			isDeletingProduct = false;
		}
	}

	// ─── Category Modal ───────────────────────────────────────────────────────────
	let catModalOpen = $state(false);
	let catModalMode = $state<'create' | 'edit'>('create');
	let targetCategory = $state<Category | null>(null);
	let isSavingCat = $state(false);

	let catForm = $state({ name: '', slug: '', desc: '' });

	function slugify(val: string) {
		return val
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}

	function openCreateCategory() {
		catModalMode = 'create';
		targetCategory = null;
		catForm = { name: '', slug: '', desc: '' };
		catModalOpen = true;
	}

	function openEditCategory(c: Category, e?: MouseEvent) {
		e?.stopPropagation();
		catModalMode = 'edit';
		targetCategory = c;
		catForm = { name: c.name, slug: c.slug, desc: c.desc ?? '' };
		catModalOpen = true;
	}

	async function saveCategory() {
		if (!catForm.name.trim() || !catForm.slug.trim()) {
			toast.error('Name and slug are required');
			return;
		}
		isSavingCat = true;
		try {
			const payload = {
				name: catForm.name.trim(),
				slug: catForm.slug.trim(),
				...(catForm.desc.trim() ? { desc: catForm.desc.trim() } : {})
			};

			let res: Response;
			if (catModalMode === 'create') {
				res = await fetch('/api/category/add', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			} else {
				res = await fetch(`/api/category/update/${targetCategory!.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			}

			const json = await res.json();
			if (!json.success) {
				toast.error(parseError(json.error), { duration: 2000 });
				return;
			}
			toast.success(catModalMode === 'create' ? 'Category created!' : 'Category updated!', {
				duration: 2000
			});
			catModalOpen = false;
			await invalidateAll();
		} catch {
			toast.error('Network error', { duration: 2000 });
		} finally {
			isSavingCat = false;
		}
	}

	// ─── Delete Category ──────────────────────────────────────────────────────────
	let deleteCatOpen = $state(false);
	let targetDeleteCat = $state<Category | null>(null);
	let isDeletingCat = $state(false);

	function openDeleteCategory(c: Category, e?: MouseEvent) {
		e?.stopPropagation();
		targetDeleteCat = c;
		deleteCatOpen = true;
	}

	async function confirmDeleteCategory() {
		if (!targetDeleteCat) return;
		isDeletingCat = true;
		try {
			const res = await fetch(`/api/category/delete/${targetDeleteCat.id}`, { method: 'DELETE' });
			const json = await res.json();
			if (!json.success) {
				toast.error(parseError(json.error), { duration: 2000 });
				return;
			}
			toast.success(`Category "${targetDeleteCat.name}" deleted`, { duration: 2000 });
			deleteCatOpen = false;
			targetDeleteCat = null;
			await invalidateAll();
		} catch {
			toast.error('Network error', { duration: 2000 });
		} finally {
			isDeletingCat = false;
		}
	}
</script>

<Toaster richColors theme={themeData.value} position="top-right" />

<div class="flex animate-in flex-col gap-6 p-6 duration-500 fade-in">

	<!-- ── Page Header ── -->
	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-xl font-semibold tracking-tight text-foreground">Product & Category Management</h1>
			<p class="mt-0.5 text-sm text-muted-foreground">Manage your product catalog and categories.</p>
		</div>

		<!-- Action button: changes depending on tab -->
		{#if activeTab === 'products'}
			<a
				href="/admin/products/create"
				class="sprd-btn sprd-btn--default sprd-btn--sm flex items-center gap-1.5"
			>
				<RiAddLine class="h-4 w-4" /> New Product
			</a>
		{:else}
			<button
				class="sprd-btn sprd-btn--default sprd-btn--sm flex items-center gap-1.5"
				onclick={openCreateCategory}
			>
				<RiAddLine class="h-4 w-4" /> New Category
			</button>
		{/if}
	</div>

	<!-- ── Tabs ── -->
	<div class="flex items-center gap-1 bg-secondary/10 p-1 rounded-xl w-fit border border-border">
		{#each [{ id: 'products', label: 'Products', Icon: RiShoppingBagLine }, { id: 'categories', label: 'Categories', Icon: RiPriceTagLine }] as tab}
			<button
				class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all {activeTab === tab.id
					? 'bg-card shadow-sm text-foreground'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = tab.id as TabId)}
			>
				<tab.Icon class="h-3.5 w-3.5" />
				{tab.label}
			</button>
		{/each}
	</div>

	<!-- ══════════════════ PRODUCTS TAB ══════════════════ -->
	{#if activeTab === 'products'}
		{#await data.dataPromise}
			<!-- Loading skeleton -->
			<div class="space-y-2">
				<Skeleton class="h-9 w-64" />
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					{#each Array(5) as _}
						<div class="flex items-center gap-4 px-4 py-3 border-b border-border/60">
							<Skeleton class="h-10 w-10 rounded-lg" />
							<div class="flex-1 space-y-1.5">
								<Skeleton class="h-3.5 w-48" />
								<Skeleton class="h-3 w-24" />
							</div>
							<Skeleton class="h-5 w-16 rounded-full" />
							<Skeleton class="h-5 w-20 rounded-full" />
							<Skeleton class="h-4 w-24 font-mono" />
							<Skeleton class="h-7 w-7 rounded-md" />
						</div>
					{/each}
				</div>
			</div>
		{:then res}
			{@const filteredProducts = filterProducts(res.products)}

			<!-- Search + count -->
			<div class="flex items-center justify-between gap-3">
				<div class="relative w-72">
					<RiSearchLine class="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input bind:value={searchProducts} placeholder="Search products..." class="bg-card pl-8 text-sm" />
				</div>
				<span class="text-xs font-medium text-muted-foreground">
					{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
				</span>
			</div>

			{#if res.error}
				<div class="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive flex items-center justify-center gap-2">
					<RiErrorWarningLine class="h-5 w-5" /> {res.error}
				</div>
			{:else}
				<div class="overflow-hidden rounded-lg border border-border bg-card">
					<Table>
						<TableHeader>
							<TableRow class="border-b border-border/60 bg-muted/30">
								<TableHead class="pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</TableHead>
								<TableHead class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
								<TableHead class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Featured</TableHead>
								<TableHead class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</TableHead>
								<TableHead class="pr-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#if filteredProducts.length === 0}
								<TableRow class="hover:bg-transparent">
									<TableCell colspan={5} class="py-16 text-center">
										<div class="flex flex-col items-center gap-2 text-muted-foreground">
											<RiShoppingBagLine class="h-8 w-8 opacity-30" />
											<span class="text-sm">No products found</span>
										</div>
									</TableCell>
								</TableRow>
							{:else}
								{#each filteredProducts as product (product.id)}
									<TableRow class="border-b border-border/60 transition-colors hover:bg-muted/30">
										<!-- Product info -->
										<TableCell class="py-3 pl-4">
											<div class="flex items-center gap-3">
												<!-- Thumbnail -->
												<div class="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
													style="background: var(--secondary);">
													{#if product.imageUrl}
														<img src={product.imageUrl} alt={product.name} class="h-full w-full object-cover" />
													{:else}
														<RiImageLine class="h-5 w-5 text-white/60" />
													{/if}
												</div>
												<div class="min-w-0">
													<p class="truncate text-sm font-medium leading-tight text-foreground">{product.name}</p>
													<p class="truncate text-xs text-muted-foreground font-mono">{product.slug}</p>
												</div>
											</div>
										</TableCell>

										<!-- Status badge -->
										<TableCell class="py-3">
											{#if product.status === 'active'}
												<Badge class="bg-[var(--chart-4)] text-white hover:bg-[var(--chart-4)]/80 border-transparent text-[10px] font-bold uppercase tracking-wide">
													<RiCheckboxCircleLine class="mr-1 h-3 w-3" /> Active
												</Badge>
											{:else}
												<Badge variant="outline" class="text-[10px] font-bold uppercase tracking-wide text-muted-foreground border-muted">
													<RiCloseCircleLine class="mr-1 h-3 w-3" /> Inactive
												</Badge>
											{/if}
										</TableCell>

										<!-- Featured -->
										<TableCell class="py-3">
											{#if product.is_featured}
												<span class="flex items-center gap-1 text-xs font-semibold" style="color: var(--primary);">
													<RiStarFill class="h-3.5 w-3.5" /> Featured
												</span>
											{:else}
												<span class="text-xs text-muted-foreground/40 italic">—</span>
											{/if}
										</TableCell>

										<!-- Price -->
										<TableCell class="py-3 font-mono text-sm font-bold">
											{formatCurrency(product.price)}
										</TableCell>

										<!-- Actions -->
										<TableCell class="py-3 pr-3 text-right">
											<DropdownMenu>
												<DropdownMenuTrigger onclick={(e) => e.stopPropagation()}>
													<Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground">
														<RiMore2Line class="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" class="w-40">
													<DropdownMenuItem>
														<a href="/admin/products/{product.id}" class="flex items-center w-full">
															<RiEditLine class="mr-2 h-3.5 w-3.5" /> Edit
														</a>
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														class="text-destructive focus:text-destructive"
														onclick={(e) => openDeleteProduct(product, e)}
													>
														<RiDeleteBin7Line class="mr-2 h-3.5 w-3.5" /> Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								{/each}
							{/if}
						</TableBody>
					</Table>
				</div>
				<p class="text-xs text-muted-foreground">Use ··· menu to edit or delete a product</p>
			{/if}
		{:catch}
			<div class="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive">
				Failed to connect to server.
			</div>
		{/await}
	{/if}

	<!-- ══════════════════ CATEGORIES TAB ══════════════════ -->
	{#if activeTab === 'categories'}
		{#await data.dataPromise}
			<div class="space-y-2">
				<Skeleton class="h-9 w-64" />
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					{#each Array(4) as _}
						<div class="flex items-center gap-4 px-4 py-3 border-b border-border/60">
							<Skeleton class="h-8 w-8 rounded-lg" />
							<div class="flex-1 space-y-1.5">
								<Skeleton class="h-3.5 w-36" />
								<Skeleton class="h-3 w-24" />
							</div>
							<Skeleton class="h-4 w-40" />
							<Skeleton class="h-7 w-7 rounded-md" />
						</div>
					{/each}
				</div>
			</div>
		{:then res}
			{@const filteredCats = filterCategories(res.categories)}

			<div class="flex items-center justify-between gap-3">
				<div class="relative w-72">
					<RiSearchLine class="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input bind:value={searchCategories} placeholder="Search categories..." class="bg-card pl-8 text-sm" />
				</div>
				<span class="text-xs font-medium text-muted-foreground">
					{filteredCats.length} categor{filteredCats.length !== 1 ? 'ies' : 'y'}
				</span>
			</div>

			{#if res.error}
				<div class="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive flex items-center justify-center gap-2">
					<RiErrorWarningLine class="h-5 w-5" /> {res.error}
				</div>
			{:else}
				<div class="overflow-hidden rounded-lg border border-border bg-card">
					<Table>
						<TableHeader>
							<TableRow class="border-b border-border/60 bg-muted/30">
								<TableHead class="pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
								<TableHead class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slug</TableHead>
								<TableHead class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</TableHead>
								<TableHead class="pr-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#if filteredCats.length === 0}
								<TableRow class="hover:bg-transparent">
									<TableCell colspan={4} class="py-16 text-center">
										<div class="flex flex-col items-center gap-2 text-muted-foreground">
											<RiPriceTagLine class="h-8 w-8 opacity-30" />
											<span class="text-sm">No categories found</span>
										</div>
									</TableCell>
								</TableRow>
							{:else}
								{#each filteredCats as cat (cat.id)}
									<TableRow class="border-b border-border/60 transition-colors hover:bg-muted/30">
										<TableCell class="py-3 pl-4">
											<span class="inline-flex h-5 items-center rounded-full px-2.5 text-[11px] font-medium bg-primary text-primary-foreground">
												{cat.name}
											</span>
										</TableCell>
										<TableCell class="py-3 font-mono text-xs text-muted-foreground">{cat.slug}</TableCell>
										<TableCell class="py-3 text-sm text-muted-foreground max-w-[300px]">
											<span class="line-clamp-1">{cat.desc ?? '—'}</span>
										</TableCell>
										<TableCell class="py-3 pr-3 text-right">
											<DropdownMenu>
												<DropdownMenuTrigger onclick={(e) => e.stopPropagation()}>
													<Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground">
														<RiMore2Line class="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" class="w-36">
													<DropdownMenuItem onclick={(e) => openEditCategory(cat, e)}>
														<RiEditLine class="mr-2 h-3.5 w-3.5" /> Edit
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														class="text-destructive focus:text-destructive"
														onclick={(e) => openDeleteCategory(cat, e)}
													>
														<RiDeleteBin7Line class="mr-2 h-3.5 w-3.5" /> Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								{/each}
							{/if}
						</TableBody>
					</Table>
				</div>
				<p class="text-xs text-muted-foreground">Use ··· menu to edit or delete a category</p>
			{/if}
		{:catch}
			<div class="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive">
				Failed to connect to server.
			</div>
		{/await}
	{/if}
</div>

<!-- ─── Delete Product AlertDialog ──────────────────────────────────────────── -->
<AlertDialog bind:open={deleteProductOpen}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete product?</AlertDialogTitle>
			<AlertDialogDescription>
				<span class="font-medium text-foreground">"{targetProduct?.name}"</span> will be permanently removed along with all its images and category assignments.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel onclick={() => (deleteProductOpen = false)}>Cancel</AlertDialogCancel>
			<AlertDialogAction
				class="bg-destructive text-white hover:bg-destructive/90 flex items-center gap-2"
				onclick={confirmDeleteProduct}
				disabled={isDeletingProduct}
			>
				{#if isDeletingProduct}<RiLoader4Line class="h-4 w-4 animate-spin" />{/if}
				Delete
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<!-- ─── Category Modal (Create / Edit) ──────────────────────────────────────── -->
{#if catModalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
		onclick={() => !isSavingCat && (catModalOpen = false)}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="bg-card rounded-2xl p-6 shadow-xl w-full max-w-sm border"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between mb-5">
				<h3 class="text-base font-semibold tracking-tight">
					{catModalMode === 'create' ? 'New Category' : 'Edit Category'}
				</h3>
				<button
					class="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"
					onclick={() => (catModalOpen = false)}
				>
					<RiCloseLine class="h-4 w-4" />
				</button>
			</div>

			<div class="flex flex-col gap-4">
				<!-- Name -->
				<div class="flex flex-col gap-1.5">
					<label for="cat-name" class="text-xs font-medium text-foreground">Name <span class="text-destructive">*</span></label>
					<Input
						id="cat-name"
						bind:value={catForm.name}
						placeholder="e.g. Graphic Design"
						class="h-8 text-sm"
						oninput={() => {
							if (catModalMode === 'create') catForm.slug = slugify(catForm.name);
						}}
					/>
				</div>

				<!-- Slug -->
				<div class="flex flex-col gap-1.5">
					<label for="cat-slug" class="text-xs font-medium text-foreground">Slug <span class="text-destructive">*</span></label>
					<Input
						id="cat-slug"
						bind:value={catForm.slug}
						placeholder="e.g. graphic-design"
						class="h-8 text-sm font-mono"
					/>
					<p class="text-[11px] text-muted-foreground">Auto-generated from name, but editable.</p>
				</div>

				<!-- Description -->
				<div class="flex flex-col gap-1.5">
					<label for="cat-desc" class="text-xs font-medium text-foreground">Description <span class="text-muted-foreground">(optional)</span></label>
					<textarea
						id="cat-desc"
						bind:value={catForm.desc}
						placeholder="Short description..."
						rows={3}
						class="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
					></textarea>
				</div>
			</div>

			<div class="flex gap-2 justify-end mt-5">
				<button
					class="sprd-btn sprd-btn--outline sprd-btn--sm"
					onclick={() => (catModalOpen = false)}
					disabled={isSavingCat}
				>
					Cancel
				</button>
				<button
					class="sprd-btn sprd-btn--default sprd-btn--sm flex items-center gap-1.5"
					onclick={saveCategory}
					disabled={isSavingCat}
				>
					{#if isSavingCat}
						<RiLoader4Line class="h-4 w-4 animate-spin" />
					{:else}
						<RiCheckLine class="h-4 w-4" />
					{/if}
					{catModalMode === 'create' ? 'Create' : 'Save Changes'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- ─── Delete Category AlertDialog ─────────────────────────────────────────── -->
<AlertDialog bind:open={deleteCatOpen}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete category?</AlertDialogTitle>
			<AlertDialogDescription>
				Category <span class="font-medium text-foreground">"{targetDeleteCat?.name}"</span> will be permanently removed.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel onclick={() => (deleteCatOpen = false)}>Cancel</AlertDialogCancel>
			<AlertDialogAction
				class="bg-destructive text-white hover:bg-destructive/90 flex items-center gap-2"
				onclick={confirmDeleteCategory}
				disabled={isDeletingCat}
			>
				{#if isDeletingCat}<RiLoader4Line class="h-4 w-4 animate-spin" />{/if}
				Delete
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<style>
	.sprd-btn {
		display: inline-flex; align-items: center; justify-content: center; gap: 6px;
		height: 36px; padding: 0 14px; border-radius: 6.5px;
		font-family: inherit; font-size: 14px; font-weight: 500; letter-spacing: -0.01em;
		border: 1px solid transparent; cursor: pointer; transition: all 0.15s; white-space: nowrap;
		text-decoration: none;
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
