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
		RiArrowRightLine,
		RiArrowLeftSLine,
		RiArrowRightSLine,
		RiCheckboxCircleLine,
		RiRefreshLine,
		RiTimeLine,
		RiUserSmileLine,
		RiBrushLine,
		RiFlashlightLine,
		RiVerifiedBadgeLine
	} from 'remixicon-svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { resolveImg } from '$lib/api_utils.js';

	let { data } = $props();

	let cat = $state('all');
	let search = $state('');
	let selectedId = $state<string | null>(null);
	let showAuthPopup = $state(false);
	let showOrderConfirmModal = $state(false);
	let currentImageIndex = $state(0);

	function getProductImages(product: any) {
		if (!product) return [];
		if (product.images && product.images.length > 0) {
			return product.images.map((img: string) => resolveImg(img));
		}
		if (product.imageUrl) return [resolveImg(product.imageUrl)];
		return [];
	}

	$effect(() => {
		if (selectedId) {
			currentImageIndex = 0;
		}
	});

	function autoPlay(node: HTMLElement, count: number) {
		let interval: any;
		if (count > 1) {
			interval = setInterval(() => {
				currentImageIndex = (currentImageIndex + 1) % count;
			}, 3000);
		}
		return {
			update(newCount: number) {
				if (interval) clearInterval(interval);
				if (newCount > 1) {
					interval = setInterval(() => {
						currentImageIndex = (currentImageIndex + 1) % newCount;
					}, 3000);
				}
			},
			destroy() {
				if (interval) clearInterval(interval);
			}
		};
	}

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	};

	let productReviews = $state<any[]>([]);
	let isLoadingReviews = $state(false);

	$effect(() => {
		if (selectedId) {
			currentImageIndex = 0;
			isLoadingReviews = true;
			fetch(`/api/reviews/product/${selectedId}`)
				.then((res) => res.json())
				.then((d) => {
					if (d.data) {
						productReviews = d.data.map((r: any) => ({
							id: r.id,
							user_name: r.user?.full_name || 'Customer',
							user_initial: r.user?.full_name
								? r.user.full_name.substring(0, 2).toUpperCase()
								: 'CU',
							rating: r.rating,
							text: r.comment
						}));
					} else {
						productReviews = [];
					}
				})
				.catch(() => {
					productReviews = [];
				})
				.finally(() => {
					isLoadingReviews = false;
				});
		}
	});

	let isOrdering = $state(false);

	const handleOrderClick = () => {
		const { user } = data;
		if (!user) {
			showAuthPopup = true;
			return;
		}
		if (!selectedId) return;
		showOrderConfirmModal = true;
	};

	const handleOrder = async () => {
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
			showOrderConfirmModal = false;
		}
	};

	/* unique gradient per product id */
	const gradientPalettes = [
		'linear-gradient(135deg, oklch(0.38 0.14 265) 0%, oklch(0.54 0.22 262) 100%)',
		'linear-gradient(135deg, oklch(0.54 0.22 262) 0%, oklch(0.86 0.17 92) 100%)',
		'linear-gradient(135deg, oklch(0.60 0.20 25) 0%, oklch(0.70 0.15 162) 100%)',
		'linear-gradient(135deg, oklch(0.70 0.15 162) 0%, oklch(0.63 0.19 292) 100%)',
		'linear-gradient(135deg, oklch(0.86 0.17 92) 0%, oklch(0.60 0.20 25) 100%)'
	];

	function getProductGradient(id: string) {
		const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
		return gradientPalettes[hash % gradientPalettes.length];
	}
</script>

<div class="flex h-full w-full flex-col overflow-y-auto pb-16">
	<!-- ── Header ───────────────────────────────────── -->
	<header
		class="sticky top-0 z-20 flex h-[52px] shrink-0 items-center justify-between border-b bg-background/85 px-6 backdrop-blur-md"
	>
		<span class="text-sm font-semibold tracking-tight text-foreground">Products</span>
		<Button variant="ghost" size="icon" class="h-9 w-9 rounded-lg text-muted-foreground">
			<RiFilter3Line class="h-4 w-4" />
		</Button>
	</header>

	{#await data.dataPromise}
		<!-- skeleton -->
		<div class="p-6 sm:p-8">
			<div class="mb-8">
				<Skeleton class="mb-3 h-10 w-56 rounded-xl" />
				<Skeleton class="h-4 w-80" />
			</div>
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each Array(8) as _}
					<div class="overflow-hidden rounded-2xl border border-border bg-card">
						<Skeleton class="h-44 w-full rounded-none" />
						<div class="space-y-2 p-4">
							<Skeleton class="h-3 w-16" />
							<Skeleton class="h-5 w-3/4" />
							<Skeleton class="mt-4 h-4 w-24" />
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:then res}
		{@const allProducts = res.products || []}
		{@const allCategories = res.categories || []}
		{@const filtered = allProducts.filter((p) => {
			if (p.status !== 'active') return false;
			const matchCat = cat === 'all' || (p.categories && p.categories.some((c) => c.slug === cat));
			const matchQ =
				!search ||
				p.name.toLowerCase().includes(search.toLowerCase()) ||
				(p.description && p.description.toLowerCase().includes(search.toLowerCase()));
			return matchCat && matchQ;
		})}
		{@const selected = allProducts.find((p) => p.id === selectedId)}

		<div class="w-full p-6 sm:p-8">
			<!-- ── Hero heading ──────────────────────────── -->
			<div class="mb-10 max-w-xl">
				<div class="mb-3 flex items-center gap-2">
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold tracking-widest text-primary uppercase"
					>
						<RiVerifiedBadgeLine class="h-3.5 w-3.5" /> Professional Services
					</span>
				</div>
				<h1 class="mb-3 text-4xl font-bold tracking-tight text-foreground">Services Catalogue</h1>
				<p class="text-base leading-relaxed text-muted-foreground">
					Pilih jasa editing yang Anda butuhkan dan Tim kami akan langsung mulai garap materi Anda
					hari ini juga.
				</p>
			</div>

			<!-- ── Search + Filter ────────────────────────── -->
			<div class="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
					<!-- Search -->
					<div class="relative shrink-0 sm:w-64">
						<RiSearchLine
							class="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						/>
						<input
							type="text"
							bind:value={search}
							placeholder="Cari layanan..."
							class="w-full rounded-xl border border-border bg-card py-2.5 pr-4 pl-10 text-sm ring-primary/30 transition-all outline-none focus:border-primary/50 focus:ring-2"
						/>
					</div>

					<!-- Category tabs -->
					<div
						class="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto rounded-xl border border-border bg-card p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						<button
							onclick={() => (cat = 'all')}
							class="rounded-lg px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-all {cat ===
							'all'
								? 'bg-primary text-primary-foreground shadow-sm'
								: 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'}"
						>
							All
						</button>
						{#each allCategories as category}
							<button
								onclick={() => (cat = category.slug)}
								class="rounded-lg px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-all {cat ===
								category.slug
									? 'bg-primary text-primary-foreground shadow-sm'
									: 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'}"
							>
								{category.name}
							</button>
						{/each}
					</div>
				</div>

				<span class="shrink-0 text-sm font-medium text-muted-foreground">
					{filtered.length} layanan
				</span>
			</div>

			<!-- ── Products Grid ──────────────────────────── -->
			{#if filtered.length === 0}
				<div
					class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-28 text-center"
				>
					<div class="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/50">
						<RiSearchLine class="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 class="font-semibold text-foreground">Layanan tidak ditemukan</h3>
					<p class="text-sm text-muted-foreground">Coba kata kunci atau kategori lain</p>
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							search = '';
							cat = 'all';
						}}
						class="mt-2 rounded-xl"
					>
						Reset filter
					</Button>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each filtered as p (p.id)}
						<button
							onclick={() => (selectedId = selectedId === p.id ? null : p.id)}
							class="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg {selectedId ===
							p.id
								? 'border-primary ring-2 ring-primary/30'
								: 'border-border hover:border-primary/40'}"
						>
							<!-- Thumbnail -->
							<div class="relative h-44 w-full shrink-0 overflow-hidden">
								{#if p.imageUrl}
									<img
										src={resolveImg(p.imageUrl)}
										alt={p.name}
										class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
									<div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
								{:else}
									<div class="h-full w-full" style="background: {getProductGradient(p.id)};"></div>
									<div class="absolute inset-0 flex items-center justify-center">
										<RiSparkling2Line class="h-10 w-10 text-white/80" />
									</div>
								{/if}

								<!-- Category badge on top of image -->
								{#if p.categories && p.categories.length > 0}
									<div class="absolute top-3 left-3">
										<span
											class="inline-block rounded-lg bg-black/40 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white/90 uppercase backdrop-blur-sm"
										>
											{p.categories[0].name}
										</span>
									</div>
								{/if}

								<!-- Rating badge top-right -->
								<div class="absolute top-3 right-3">
									<span
										class="inline-flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm"
									>
										<RiStarFill class="h-3 w-3 text-yellow-400" /> 4.8
									</span>
								</div>
							</div>

							<!-- Body -->
							<div class="flex flex-1 flex-col gap-1.5 p-4">
								<h3
									class="line-clamp-2 text-[15px] leading-snug font-semibold text-card-foreground"
								>
									{p.name}
								</h3>
								{#if p.description}
									<p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
										{p.description}
									</p>
								{/if}
								<div
									class="mt-auto flex items-center justify-between border-t border-border/50 pt-3"
								>
									<span class="text-base font-bold tracking-tight text-foreground">
										{formatPrice(p.price)}
									</span>
									<span
										class="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
									>
										Order →
									</span>
								</div>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- ── Slide-in Detail Panel ──────────────────── -->
		{#if selected}
			{@const productImages = getProductImages(selected)}

			<!-- backdrop -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
				onclick={() => (selectedId = null)}
			></div>

			<!-- panel -->
			<div
				class="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-card shadow-2xl sm:max-w-[420px]"
			>
				<!-- Panel header -->
				<div class="flex items-center justify-between border-b border-border px-4 py-3">
					<Button
						variant="ghost"
						size="sm"
						onclick={() => (selectedId = null)}
						class="gap-1.5 rounded-xl text-muted-foreground hover:text-foreground"
					>
						<RiArrowLeftLine class="h-4 w-4" />
						<span class="text-sm">Kembali</span>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => (selectedId = null)}
						class="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
					>
						<RiCloseLine class="h-5 w-5" />
					</Button>
				</div>

				<!-- Panel scroll body -->
				<div class="flex-1 space-y-6 overflow-y-auto p-5 pb-8">
					<!-- Image carousel -->
					<div
						class="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-secondary"
						use:autoPlay={productImages.length}
					>
						{#if productImages.length > 0}
							<img
								src={productImages[currentImageIndex]}
								alt="{selected.name} — foto {currentImageIndex + 1}"
								class="h-full w-full object-cover transition-all duration-500"
							/>
							{#if productImages.length > 1}
								<div
									class="absolute inset-0 flex items-center justify-between p-2 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<button
										class="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
										onclick={(e) => {
											e.stopPropagation();
											currentImageIndex =
												currentImageIndex === 0 ? productImages.length - 1 : currentImageIndex - 1;
										}}
									>
										<RiArrowLeftSLine class="h-5 w-5" />
									</button>
									<button
										class="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
										onclick={(e) => {
											e.stopPropagation();
											currentImageIndex = (currentImageIndex + 1) % productImages.length;
										}}
									>
										<RiArrowRightSLine class="h-5 w-5" />
									</button>
								</div>
								<div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
									{#each productImages as _, i}
										<button
											class="rounded-full transition-all {i === currentImageIndex
												? 'h-1.5 w-4 bg-white'
												: 'h-1.5 w-1.5 bg-white/50'}"
											onclick={(e) => {
												e.stopPropagation();
												currentImageIndex = i;
											}}
											aria-label="Foto {i + 1}"
										></button>
									{/each}
								</div>
							{/if}
						{:else}
							<div
								class="h-full w-full"
								style="background: {getProductGradient(selected.id)};"
							></div>
							<RiSparkling2Line class="absolute h-12 w-12 text-white/60" />
						{/if}
					</div>

					<!-- Product info -->
					<div>
						<div class="mb-3 flex flex-wrap items-center gap-2">
							{#if selected.categories && selected.categories.length > 0}
								<Badge
									variant="secondary"
									class="rounded-lg text-[11px] font-bold tracking-wider uppercase"
								>
									{selected.categories[0].name}
								</Badge>
							{/if}
							<Badge variant="outline" class="gap-1 rounded-lg text-[11px]">
								<RiStarFill class="h-3 w-3 text-yellow-500" /> 4.8 (24 ulasan)
							</Badge>
						</div>
						<h2 class="mb-2 text-2xl leading-snug font-bold tracking-tight">{selected.name}</h2>
						<p class="text-sm leading-relaxed text-muted-foreground">
							{selected.description || 'Belum ada deskripsi untuk layanan ini.'}
						</p>
					</div>

					<Separator />

					<!-- Benefit highlights -->
					<div class="grid grid-cols-3 gap-3">
						{#each [{ icon: RiFlashlightLine, label: 'Fast Delivery', sub: 'Cepat & tepat waktu' }, { icon: RiBrushLine, label: 'Pro Quality', sub: 'Tim berpengalaman' }, { icon: RiUserSmileLine, label: 'Revisi Gratis', sub: 'Sampai puas' }] as item}
							<div
								class="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-secondary/30 p-3 text-center"
							>
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary"
								>
									<svelte:component this={item.icon} class="h-4 w-4" />
								</div>
								<span class="text-[11px] leading-tight font-bold text-foreground">{item.label}</span
								>
								<span class="text-[10px] leading-tight text-muted-foreground">{item.sub}</span>
							</div>
						{/each}
					</div>

					<Separator />

					<!-- Reviews -->
					<div class="space-y-3">
						<h3
							class="flex items-center gap-2 text-sm font-bold tracking-wider text-foreground uppercase"
						>
							<RiStarFill class="h-4 w-4 text-primary" />
							Ulasan Pelanggan
						</h3>

						{#if isLoadingReviews}
							<div class="space-y-3">
								<Skeleton class="h-20 w-full rounded-xl" />
								<Skeleton class="h-20 w-full rounded-xl" />
							</div>
						{:else if productReviews.length > 0}
							<div class="space-y-3">
								{#each productReviews as review (review.id)}
									<div class="rounded-xl border border-border/60 bg-secondary/20 p-4">
										<div class="mb-2 flex items-center justify-between">
											<div class="flex items-center gap-2.5">
												<div
													class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary"
												>
													{review.user_initial}
												</div>
												<span class="text-sm font-semibold">{review.user_name}</span>
											</div>
											<div class="flex gap-0.5">
												{#each Array(5) as _, i}
													{#if i < review.rating}
														<RiStarFill class="h-3.5 w-3.5 text-yellow-500" />
													{:else}
														<RiStarLine class="h-3.5 w-3.5 text-muted-foreground/40" />
													{/if}
												{/each}
											</div>
										</div>
										{#if review.text}
											<p class="text-sm leading-relaxed text-muted-foreground">
												&ldquo;{review.text}&rdquo;
											</p>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<div class="rounded-xl border border-dashed p-5 text-center">
								<p class="text-sm text-muted-foreground italic">
									Belum ada ulasan untuk layanan ini.
								</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Checkout footer -->
				<div class="border-t border-border bg-card p-4">
					<div class="mb-3 flex items-center justify-between">
						<div>
							<p class="mb-0.5 text-xs text-muted-foreground">Total harga</p>
							<span class="font-mono text-2xl font-bold tracking-tight text-foreground"
								>{formatPrice(selected.price)}</span
							>
						</div>
						<div class="text-right">
							<p class="text-[10px] text-muted-foreground">Pembayaran aman</p>
							<p class="text-[10px] font-semibold text-primary">QRIS / VA</p>
						</div>
					</div>
					<Button
						onclick={handleOrderClick}
						disabled={isOrdering}
						class="w-full gap-2 rounded-xl py-5 text-base font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
					>
						{isOrdering ? 'Memproses...' : 'Pesan Sekarang'}
						{#if isOrdering}
							<RiRefreshLine class="h-5 w-5 animate-spin" />
						{:else}
							<RiArrowRightLine class="h-5 w-5" />
						{/if}
					</Button>
				</div>
			</div>
		{/if}
	{:catch}
		<div class="flex flex-col items-center justify-center gap-3 p-8 text-center">
			<p class="font-medium text-destructive">Gagal memuat produk. Pastikan backend aktif.</p>
		</div>
	{/await}

	<!-- ── Auth Required Modal ────────────────────── -->
	{#if showAuthPopup}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
			onclick={() => (showAuthPopup = false)}
		>
			<div
				class="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="p-6 text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15"
					>
						<RiShieldCheckFill class="h-8 w-8 text-primary" />
					</div>
					<h3 class="mb-1 text-xl font-bold tracking-tight">Login Diperlukan</h3>
					<p class="mb-6 text-sm leading-relaxed text-muted-foreground">
						Kamu perlu login sebelum memesan agar transaksimu bisa dilacak.
					</p>
					<div class="flex flex-col gap-2">
						<Button onclick={() => goto('/auth')} class="w-full rounded-xl py-2.5">
							Ke Halaman Login
						</Button>
						<Button
							variant="ghost"
							onclick={() => (showAuthPopup = false)}
							class="w-full rounded-xl py-2.5 text-muted-foreground"
						>
							Batal
						</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- ── Order Confirm Modal ────────────────────── -->
	{#if showOrderConfirmModal}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
			onclick={() => (showOrderConfirmModal = false)}
		>
			<div
				class="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="p-6 text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
						style="background: oklch(0.70 0.15 162 / 0.15); color: var(--chart-4);"
					>
						<RiCheckboxCircleLine class="h-8 w-8" />
					</div>
					<h3 class="mb-1 text-xl font-bold tracking-tight">Konfirmasi Pesanan</h3>
					<p class="mb-6 text-sm leading-relaxed text-muted-foreground">
						Yakin ingin memesan layanan ini? Kamu akan diarahkan ke halaman pembayaran.
					</p>
					<div class="flex flex-col gap-2">
						<Button
							onclick={handleOrder}
							disabled={isOrdering}
							class="w-full gap-2 rounded-xl py-2.5"
						>
							{#if isOrdering}<RiRefreshLine class="h-4 w-4 animate-spin" />{/if}
							Ya, Konfirmasi Pesanan
						</Button>
						<Button
							variant="ghost"
							onclick={() => (showOrderConfirmModal = false)}
							disabled={isOrdering}
							class="w-full rounded-xl py-2.5 text-muted-foreground"
						>
							Batal
						</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
