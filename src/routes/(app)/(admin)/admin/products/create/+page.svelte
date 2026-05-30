<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast, Toaster } from 'svelte-sonner';
	import { themeData } from '$lib/state/theme.svelte.js';
	import { parseError } from '$lib/api_utils.js';
	import type { Category } from '$lib/types/category';
	import {
		RiArrowLeftLine,
		RiLoader4Line,
		RiCheckLine,
		RiPriceTag3Line,
		RiStarLine,
		RiStarFill
	} from 'remixicon-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';

	const { data } = $props();

	// ─── Form State ───────────────────────────────────────────────────────────────
	let form = $state({
		name: '',
		slug: '',
		description: '',
		price: '',
		status: 'active' as 'active' | 'not_available',
		is_featured: false
	});

	let selectedCategoryIds = $state<string[]>([]);
	let isSubmitting = $state(false);

	// ─── Slug auto-gen ────────────────────────────────────────────────────────────
	let slugManuallyEdited = $state(false);

	function slugify(val: string) {
		return val
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}

	function onNameInput() {
		if (!slugManuallyEdited) {
			form.slug = slugify(form.name);
		}
	}

	// ─── Category toggle ──────────────────────────────────────────────────────────
	function toggleCategory(id: string) {
		if (selectedCategoryIds.includes(id)) {
			selectedCategoryIds = selectedCategoryIds.filter((c) => c !== id);
		} else {
			selectedCategoryIds = [...selectedCategoryIds, id];
		}
	}

	// ─── Submit ───────────────────────────────────────────────────────────────────
	async function handleSubmit() {
		if (!form.name.trim() || !form.slug.trim() || !form.price) {
			toast.error('Name, slug, and price are required.');
			return;
		}

		const price = parseFloat(form.price);
		if (isNaN(price) || price < 0) {
			toast.error('Please enter a valid price.');
			return;
		}

		isSubmitting = true;

		try {
			// Step 1: Create product
			const productPayload: Record<string, unknown> = {
				name: form.name.trim(),
				slug: form.slug.trim(),
				price,
				status: form.status,
				is_featured: form.is_featured
			};
			if (form.description.trim()) {
				productPayload.description = form.description.trim();
			}

			const productRes = await fetch('/api/products/add', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(productPayload)
			});

			const productJson = await productRes.json();

			if (!productJson.success) {
				toast.error(parseError(productJson.error), { duration: 3000 });
				return;
			}

			const productId: string = productJson.data?.id;

			// Step 2: Assign categories (if any selected)
			if (selectedCategoryIds.length > 0 && productId) {
				const catRes = await fetch(`/api/products/categories/assign/${productId}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ category_ids: selectedCategoryIds })
				});

				if (!catRes.ok) {
					// Product created but category assignment failed — still navigate but warn
					toast.warning('Product created but category assignment failed. You can assign categories in the edit page.');
				}
			}

			toast.success('Product created! Redirecting to edit page to add images...', { duration: 2000 });

			// Step 3: Redirect to edit page
			if (productId) {
				await goto(`/admin/products/${productId}`);
			} else {
				await goto('/admin/products');
			}
		} catch {
			toast.error('Network error. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Toaster richColors theme={themeData.value} position="top-right" />

<div class="flex flex-1 min-h-0 animate-in flex-col gap-0 duration-500 fade-in w-full overflow-y-auto">

	<!-- ── Sticky Header ── -->
	<header class="h-[52px] px-4 md:px-6 flex items-center justify-between bg-background/85 backdrop-blur-md border-b sticky top-0 z-20 shrink-0">
		<div class="flex items-center gap-3">
			<button
				class="w-9 h-9 rounded-lg bg-transparent border-none cursor-pointer text-muted-foreground flex items-center justify-center transition-all hover:bg-secondary/20 hover:text-foreground"
				onclick={() => history.back()}
			>
				<RiArrowLeftLine class="h-5 w-5" />
			</button>
			<span class="text-sm font-medium text-muted-foreground tracking-tight">Create New Product</span>
		</div>
		<button
			class="sprd-btn sprd-btn--default sprd-btn--sm flex items-center gap-1.5"
			onclick={handleSubmit}
			disabled={isSubmitting}
		>
			{#if isSubmitting}
				<RiLoader4Line class="h-4 w-4 animate-spin" />
			{:else}
				<RiCheckLine class="h-4 w-4" />
			{/if}
			{isSubmitting ? 'Creating...' : 'Create Product'}
		</button>
	</header>

	<!-- ── Content ── -->
	<div class="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-6 pb-16">

		<!-- Product Details Card -->
		<div class="bg-card rounded-[14px] p-4 md:p-6" style="box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08), var(--shadow-xs);">
			<h2 class="text-sm font-semibold tracking-tight mb-5 flex items-center gap-2">
				<span class="w-1 h-4 rounded-full bg-primary inline-block"></span>
				Product Details
			</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
				<!-- Name -->
				<div class="col-span-2 flex flex-col gap-1.5">
					<label for="prod-name" class="text-xs font-medium text-foreground">Product Name <span class="text-destructive">*</span></label>
					<Input
						id="prod-name"
						bind:value={form.name}
						placeholder="e.g. Logo Design Package"
						class="h-9 text-sm"
						oninput={onNameInput}
					/>
				</div>

				<!-- Slug -->
				<div class="col-span-2 flex flex-col gap-1.5">
					<label for="prod-slug" class="text-xs font-medium text-foreground">Slug <span class="text-destructive">*</span></label>
					<Input
						id="prod-slug"
						bind:value={form.slug}
						placeholder="e.g. logo-design-package"
						class="h-9 text-sm font-mono"
						oninput={() => (slugManuallyEdited = true)}
					/>
					<p class="text-[11px] text-muted-foreground">Auto-generated from name. Used in product URLs.</p>
				</div>

				<!-- Description -->
				<div class="col-span-2 flex flex-col gap-1.5">
					<label for="prod-desc" class="text-xs font-medium text-foreground">Description <span class="text-muted-foreground">(optional)</span></label>
					<textarea
						id="prod-desc"
						bind:value={form.description}
						placeholder="Describe what's included in this service..."
						rows={4}
						class="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
					></textarea>
				</div>

				<!-- Price -->
				<div class="flex flex-col gap-1.5">
					<label for="prod-price" class="text-xs font-medium text-foreground">Price (IDR) <span class="text-destructive">*</span></label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">Rp</span>
						<Input
							id="prod-price"
							type="number"
							bind:value={form.price}
							min="0"
							placeholder="0"
							class="h-9 pl-9 text-sm font-mono"
						/>
					</div>
				</div>

				<!-- Status -->
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-medium text-foreground">Status <span class="text-destructive">*</span></label>
					<div class="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
						{#each [{ val: 'active', label: 'Active' }, { val: 'not_available', label: 'Inactive' }] as opt}
							<button
								class="sm:flex-1 h-10 sm:h-9 rounded-md border text-sm font-medium transition-all cursor-pointer flex items-center justify-center {form.status === opt.val
									? 'bg-secondary text-secondary-foreground border-secondary shadow-sm'
									: 'bg-background text-muted-foreground border-border hover:border-secondary/50 hover:bg-secondary/5'}"
								onclick={() => (form.status = opt.val as 'active' | 'not_available')}
							>
								{opt.label}
							</button>
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

		<!-- Categories Card -->
		<div class="bg-card rounded-[14px] p-4 md:p-6" style="box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08), var(--shadow-xs);">
			<h2 class="text-sm font-semibold tracking-tight mb-1 flex items-center gap-2">
				<span class="w-1 h-4 rounded-full bg-primary inline-block"></span>
				Categories
			</h2>
			<p class="text-xs text-muted-foreground mb-4">Select one or more categories for this product.</p>

			{#await data.categoriesPromise}
				<div class="flex flex-wrap gap-2">
					{#each Array(4) as _}
						<Skeleton class="h-7 w-24 rounded-full" />
					{/each}
				</div>
			{:then res}
				{#if res.categories.length === 0}
					<p class="text-sm text-muted-foreground italic">No categories available. Create some in the Categories tab first.</p>
				{:else}
					<div class="flex flex-wrap gap-2">
						{#each res.categories as cat}
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
						<p class="text-[11px] text-muted-foreground mt-2">{selectedCategoryIds.length} categor{selectedCategoryIds.length !== 1 ? 'ies' : 'y'} selected</p>
					{/if}
				{/if}
			{/await}
		</div>

		<!-- Info note -->
		<div class="rounded-xl border border-border/60 bg-secondary/5 p-4 flex items-start gap-3">
			<RiPriceTag3Line class="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
			<p class="text-xs text-muted-foreground leading-relaxed">
				After creating the product, you'll be redirected to the <strong class="text-foreground">Edit Product</strong> page where you can upload product images.
			</p>
		</div>
	</div>
</div>

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
	.sprd-btn--sm { height: 30px; padding: 0 10px; font-size: 13px; }
</style>
