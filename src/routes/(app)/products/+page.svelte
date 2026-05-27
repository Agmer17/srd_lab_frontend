<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import {
		RiFilter3Line,
		RiSearchLine,
		RiSparkling2Line,
		RiStarFill,
		RiStarLine,
		RiCloseLine,
		RiShieldCheckFill,
		RiArrowLeftLine,
		RiArrowRightLine
	} from 'remixicon-svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';

	let { data } = $props();

	let cat = $state('all');
	let search = $state('');
	let selectedId = $state<string | null>(null);
	let showAuthPopup = $state(false);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	};

	// Dummy reviews as requested
	const MOCK_REVIEWS = [
		{ user: 'Budi Santoso', rating: 5, text: 'Pelayanan cepat dan hasilnya memuaskan!' },
		{ user: 'Siti Rahma', rating: 4, text: 'Sangat bagus, sesuai dengan brief yang diberikan.' }
	];

	// Handle Order
	let isOrdering = $state(false);

	const handleOrder = async () => {
		const { user } = data;
		if (!user) {
			showAuthPopup = true;
			return;
		}
		
		if (!selectedId) return;

		isOrdering = true;
		try {
			const res = await fetch('/api/orders/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ product_id: selectedId })
			});
			const result = await res.json();
			
			if (res.ok && result.data?.id) {
				goto(`/orders/checkout/${result.data.id}`);
			} else {
				toast.error(result.error || result.message || 'Failed to create order. Please try again.');
			}
		} catch (error) {
			toast.error('Network error while placing order.');
		} finally {
			isOrdering = false;
		}
	};
</script>

<div class="flex flex-col min-h-screen">
	<header class="h-[52px] px-6 flex items-center justify-between bg-background/85 backdrop-blur-md border-b sticky top-0 z-20 shrink-0">
		<span class="text-sm font-medium text-muted-foreground tracking-tight">Products</span>
		<div class="flex gap-1">
			<button class="relative w-9 h-9 rounded-lg bg-transparent border-none cursor-pointer text-muted-foreground flex items-center justify-center transition-all hover:bg-secondary hover:text-foreground"><RiFilter3Line class="h-5 w-5" /></button>
		</div>
	</header>

	{#await data.dataPromise}
		<div class="products-page p-6">
			<div class="products-head mb-8">
				<Skeleton class="h-10 w-64 mb-4" />
				<Skeleton class="h-4 w-96" />
			</div>
			<div class="products-grid">
				{#each Array(6) as _}
					<div class="home-prod-card" style="box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08), var(--shadow-xs);">
						<Skeleton class="h-[140px] w-full rounded-none" />
						<div class="home-prod-body gap-2">
							<Skeleton class="h-3 w-16" />
							<Skeleton class="h-4 w-3/4" />
							<div class="home-prod-foot mt-4">
								<Skeleton class="h-4 w-24" />
								<Skeleton class="h-3 w-12" />
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:then res}
		{@const allProducts = res.products || []}
		{@const allCategories = res.categories || []}
		{@const filtered = allProducts.filter(p => {
			const matchCat = cat === 'all' || (p.categories && p.categories.some(c => c.slug === cat));
			const matchQ = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
			return matchCat && matchQ;
		})}
		{@const selected = allProducts.find(p => p.id === selectedId)}

		<div class="products-page p-6 sm:p-8 w-full">
			<div class="products-head mb-8">
				<h1 class="products-h1 text-3xl font-semibold tracking-tight text-foreground mb-2">Service Catalog</h1>
				<p class="products-sub text-muted-foreground">
					Pick a service, fill in the brief, pay with QRIS — we kick off the project the same day.
				</p>
			</div>

			<div class="products-controls flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
				<div class="products-controls-left flex flex-col sm:flex-row gap-4 flex-1">
					<!-- Search Input -->
					<div class="relative w-full sm:w-64">
						<RiSearchLine class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							bind:value={search}
							placeholder="Search services..."
							class="w-full pl-9 pr-4 py-2 bg-secondary/50 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
					
					<!-- Filter Tabs -->
					<div class="flex items-center gap-1 bg-secondary/50 p-1 rounded-full overflow-x-auto">
						<button 
							class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap {cat === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}"
							onclick={() => cat = 'all'}
						>
							All
						</button>
						{#each allCategories as category}
							<button 
								class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap {cat === category.slug ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}"
								onclick={() => cat = category.slug}
							>
								{category.name}
							</button>
						{/each}
					</div>
				</div>
				<span class="products-count text-sm font-medium text-muted-foreground">
					{filtered.length} service{filtered.length !== 1 ? 's' : ''}
				</span>
			</div>

			{#if filtered.length === 0}
				<div class="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-24 text-muted-foreground" style="border-color: oklch(0.6 0 0 / .4);">
					<RiSearchLine class="h-8 w-8 opacity-40 mb-2" />
					<h3 class="font-medium text-foreground">No services match</h3>
					<p class="text-sm">Try a different category or keyword.</p>
				</div>
			{:else}
				<div class="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{#each filtered as p (p.id)}
						<button
							class="home-prod-card text-left flex flex-col h-full bg-card rounded-2xl overflow-hidden transition-all hover:shadow-md border {selectedId === p.id ? 'ring-2 ring-primary border-transparent' : 'border-border'}"
							onclick={() => selectedId = selectedId === p.id ? null : p.id}
						>
							<div class="home-prod-thumb h-48 w-full shrink-0 relative flex items-center justify-center overflow-hidden" style={!p.imageUrl ? 'background: var(--secondary);' : ''}>
								{#if p.imageUrl}
									<img
										src={p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:6969${p.imageUrl}`}
										alt={p.name}
										class="h-full w-full object-cover transition-transform hover:scale-105"
									/>
								{:else}
									<RiSparkling2Line class="h-8 w-8 text-white/90" />
								{/if}
							</div>
							<div class="home-prod-body p-5 flex flex-col flex-1 gap-2">
								<div class="home-prod-cat text-[11px] font-semibold tracking-wider uppercase text-primary">
									{p.categories && p.categories.length > 0 ? p.categories[0].name : 'Service'}
								</div>
								<div class="home-prod-name text-base font-semibold leading-snug line-clamp-2">{p.name}</div>
								<div class="home-prod-foot mt-auto pt-4 flex items-end justify-between">
									<div class="home-prod-price text-lg font-bold tracking-tight">{formatPrice(p.price)}</div>
									<div class="home-prod-rating flex items-center gap-1 text-[13px] font-medium text-muted-foreground">
										<RiStarFill class="h-3.5 w-3.5 text-primary" />
										<span>4.8</span>
									</div>
								</div>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Slide-in Detail Panel -->
		{#if selected}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity" onclick={() => selectedId = null}></div>
			
			<div class="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
				<div class="flex items-center justify-between p-4 border-b">
					<button class="sprd-btn sprd-btn--ghost sprd-btn--sm px-2 text-muted-foreground hover:text-foreground" onclick={() => selectedId = null}>
						<RiArrowLeftLine class="h-5 w-5 mr-1" /> Back
					</button>
					<button class="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors" onclick={() => selectedId = null}>
						<RiCloseLine class="h-5 w-5" />
					</button>
				</div>
				
				<div class="flex-1 overflow-y-auto p-6 space-y-8">
					<!-- Hero Image -->
					<div class="w-full aspect-video rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
						{#if selected.imageUrl}
							<img src={selected.imageUrl.startsWith('http') ? selected.imageUrl : `http://localhost:6969${selected.imageUrl}`} alt={selected.name} class="w-full h-full object-cover" />
						{:else}
							<RiSparkling2Line class="h-12 w-12 text-white/50" />
						{/if}
					</div>

					<!-- Header Info -->
					<div>
						<div class="flex items-center gap-2 mb-3">
							<span class="text-xs font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-1 rounded-md">
								{selected.categories && selected.categories.length > 0 ? selected.categories[0].name : 'Service'}
							</span>
							<span class="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
								<RiStarFill class="h-3 w-3 text-primary" /> 4.8 (24 reviews)
							</span>
						</div>
						<h2 class="text-2xl font-bold tracking-tight mb-2">{selected.name}</h2>
						<p class="text-muted-foreground leading-relaxed text-sm">
							{selected.description || 'No description available for this service.'}
						</p>
					</div>

					<!-- Highlights/Benefits -->
					<div class="space-y-3">
						<h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">What's included</h3>
						<ul class="space-y-2">
							<li class="flex items-start gap-2 text-sm">
								<RiShieldCheckFill class="h-5 w-5 text-green-500 shrink-0" />
								<span>Professional quality guarantee</span>
							</li>
							<li class="flex items-start gap-2 text-sm">
								<RiShieldCheckFill class="h-5 w-5 text-green-500 shrink-0" />
								<span>Dedicated project manager</span>
							</li>
							<li class="flex items-start gap-2 text-sm">
								<RiShieldCheckFill class="h-5 w-5 text-green-500 shrink-0" />
								<span>Fast turnaround time</span>
							</li>
						</ul>
					</div>

					<!-- Reviews (Mocked) -->
					<div class="space-y-4">
						<h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Reviews</h3>
						{#each MOCK_REVIEWS as review}
							<div class="bg-secondary/30 p-4 rounded-xl border border-border/50">
								<div class="flex items-center justify-between mb-2">
									<span class="font-medium text-sm">{review.user}</span>
									<div class="flex gap-0.5 text-primary">
										{#each Array(5) as _, i}
											{#if i < review.rating}
												<RiStarFill class="h-3 w-3" />
											{:else}
												<RiStarLine class="h-3 w-3" />
											{/if}
										{/each}
									</div>
								</div>
								<p class="text-sm text-muted-foreground">{review.text}</p>
							</div>
						{/each}
					</div>
				</div>

				<!-- Checkout Footer -->
				<div class="p-4 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 mt-auto">
					<div class="flex items-center justify-between mb-4">
						<span class="text-sm font-medium text-muted-foreground">Total price</span>
						<span class="text-2xl font-bold">{formatPrice(selected.price)}</span>
					</div>
					<button 
						class="sprd-btn sprd-btn--primary w-full py-6 flex justify-center items-center text-base disabled:opacity-50" 
						onclick={handleOrder}
						disabled={isOrdering}
					>
						{isOrdering ? 'Processing...' : 'Order now'} <RiArrowRightLine class="h-5 w-5 ml-2" />
					</button>
					<p class="text-[11px] text-center text-muted-foreground mt-3 font-medium">Secure payment with QRIS / Virtual Account</p>
				</div>
			</div>
		{/if}
	{:catch}
		<div class="p-8 text-center text-destructive">
			Failed to load products. Ensure the backend is running.
		</div>
	{/await}

	<!-- Custom Auth Required Popup Modal -->
	{#if showAuthPopup}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity" onclick={() => showAuthPopup = false}>
			<div class="bg-card w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border transform transition-all duration-300 scale-100 opacity-100" onclick={e => e.stopPropagation()}>
				<div class="p-6 text-center">
					<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
						<RiShieldCheckFill class="h-8 w-8" />
					</div>
					<h3 class="text-xl font-bold tracking-tight mb-2">Login Required</h3>
					<p class="text-sm text-muted-foreground mb-6">
						You need to log in to your account before placing an order to track your transaction.
					</p>
					<div class="flex flex-col gap-2">
						<button class="sprd-btn sprd-btn--primary w-full py-2.5 text-sm" onclick={() => goto('/auth')}>
							Go to Login
						</button>
						<button class="sprd-btn sprd-btn--ghost w-full py-2.5 text-sm text-muted-foreground hover:text-foreground" onclick={() => showAuthPopup = false}>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
