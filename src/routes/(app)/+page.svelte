<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { resolveImg } from '$lib/api_utils.js';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { formatPrice } from '$lib/string_utils';
	import type { Product } from '$lib/types/product';
	import {
		RiArrowRightLine,
		RiArrowUpLine,
		RiPenNibLine,
		RiVideoLine,
		RiSparkling2Line,
		RiStarFill,
		RiShieldCheckLine
	} from 'remixicon-svelte';

	const { data } = $props();

	// ─── Static Data ─────────────────────────────────────────────

	const CATEGORY_TILES = [
		{
			id: 'design',
			label: 'Edit Desain Media Sosial',
			sub: 'Desain feed, story, poster, dan aset grafis siap unggah.',
			Icon: RiPenNibLine,
			bg: 'var(--primary)',
			fg: 'var(--primary-foreground)',
			count: 4
		},
		{
			id: 'video',
			label: 'Edit Video Content',
			sub: 'Rakitan footage jadi konten video dinamis dan interaktif.',
			Icon: RiVideoLine,
			bg: 'var(--secondary)',
			fg: '#fff',
			count: 3
		},
		{
			id: 'bumper',
			label: 'Edit Video Bumper',
			sub: 'Animasi motion graphic untuk intro/outro brand premium.',
			Icon: RiSparkling2Line,
			bg: 'var(--accent)',
			fg: '#fff',
			count: 2
		}
	];

	const PORTFOLIO = [
		{
			id: 'po1',
			client: 'PT Maju Digital',
			project: 'Brand Refresh 2024',
			category: 'branding',
			tint: 'var(--accent)',
			result: '3× brand recognition'
		},
		{
			id: 'po2',
			client: 'Warung Digital',
			project: 'TikTok Ad Campaign',
			category: 'video',
			tint: 'var(--secondary)',
			result: '2.1 juta views in 7 days'
		},
		{
			id: 'po3',
			client: 'Kafe Bulan Baru',
			project: 'Visual Identity System',
			category: 'branding',
			tint: 'var(--accent)',
			result: 'Full brand rollout'
		},
		{
			id: 'po4',
			client: 'Startup Nusantara',
			project: 'Investor Pitch Deck',
			category: 'design',
			tint: 'var(--primary)',
			result: 'Funded Rp 5B Series A'
		},
		{
			id: 'po5',
			client: 'Toko Batik Indah',
			project: 'Product Photography Edit',
			category: 'design',
			tint: 'var(--primary)',
			result: '+65% marketplace CTR'
		},
		{
			id: 'po6',
			client: 'Event Organizer Satu',
			project: 'Annual Gala Documentation',
			category: 'video',
			tint: 'var(--secondary)',
			result: '4K highlight reel'
		}
	];

	const TESTIMONIALS = [
		{
			id: 't1',
			user_name: 'Budi Santoso',
			user_initial: 'BS',
			company: 'PT Maju Digital',
			rating: 5,
			comment:
				'Hasil kerja SPRDlab sangat memuaskan. Branding kami sekarang jauh lebih kuat dan profesional dari sebelumnya.'
		},
		{
			id: 't2',
			user_name: 'Dewi Lestari',
			user_initial: 'DL',
			company: 'Warung Digital',
			rating: 5,
			comment:
				'Campaign TikTok kami viral! Tim SPRDlab paham banget audience kami. Sangat rekomendasikan untuk UMKM.'
		},
		{
			id: 't3',
			user_name: 'Rudi Hartono',
			user_initial: 'RH',
			company: 'Startup Nusantara',
			rating: 5,
			comment:
				'Pitch deck yang dibuat membantu kami closed funding Series A. Profesional, kreatif, dan selalu on-time.'
		},
		{
			id: 't4',
			user_name: 'Sari Indah',
			user_initial: 'SI',
			company: 'Toko Batik Indah',
			rating: 5,
			comment:
				'CTR marketplace kami naik 65% setelah pakai foto produk dari SPRDlab. Worth every penny, highly recommended!'
		}
	];

	const CAT_BADGE: Record<string, string> = {
		design: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
		video: 'bg-[var(--secondary)] text-white',
		branding: 'bg-[var(--accent)] text-white'
	};
</script>

<svelte:head>
	<title>SPRD Lab Creative — Bikin Konten Media Sosial & Video Makin Stand Out!</title>
	<meta
		name="description"
		content="Jasa edit desain media sosial, video konten, dan animasi bumper profesional. Pesan praktis, revisi terarah, dan bayar instan."
	/>
</svelte:head>

<div class="home-page overflow-y-auto">
	<!-- ══ HERO ══════════════════════════════════════════════════════ -->
	<section class="home-hero">
		<!-- Left: copy -->
		<div class="flex flex-col justify-center">
			<div class="home-hero-eyebrow">
				<span class="home-hero-eyebrow-dash"></span>
				SPRD Lab Creative — Jakarta, Indonesia
			</div>

			<h1 class="home-hero-h1">
				Bikin Konten Media Sosial<br />
				dan <span class="home-hero-h1-accent">Video</span> Brand Kamu Makin Stand Out!
			</h1>

			<p class="home-hero-sub">
				Punya materi mentah tapi bingung ngeditnya? Serahkan urusan visual brand Anda pada ahlinya.
				Pesan jasanya cepat, revisi terarah, dan transaksi super praktis
			</p>

			<div class="home-hero-cta">
				<button class="sprd-btn sprd-btn--default sprd-btn--lg" onclick={() => goto('/products')}>
					Pesan Sekarang <RiArrowRightLine class="ml-1 inline-block h-5 w-5" />
				</button>
				<button class="sprd-btn sprd-btn--outline sprd-btn--lg" onclick={() => goto('/auth')}>
					Sign in
				</button>
			</div>
		</div>

		<!-- Right: stats panel -->
		<div class="home-hero-panel">
			<div class="home-panel-logo">
				<RiSparkling2Line class="h-6 w-6 text-[var(--primary)]" />
			</div>

			<div class="home-stat-grid">
				<div>
					<div class="home-stat-value home-stat-value--accent">120+</div>
					<div class="home-stat-label">Projects</div>
				</div>
				<div>
					<div class="home-stat-value">98%</div>
					<div class="home-stat-label">Kepuasan Pelanggan</div>
				</div>
				<div>
					<div class="home-stat-value home-stat-value--accent">4.9</div>
					<div class="home-stat-label">Rata-Rata Rating</div>
				</div>
			</div>

			<div class="home-panel-note">
				<RiShieldCheckLine class="h-4 w-4 shrink-0 text-[var(--primary)]" />
				QRIS · Bank transfer
			</div>
		</div>
	</section>

	<!-- ══ WHAT WE CREATE ════════════════════════════════════════════ -->
	<section class="home-section">
		<div class="home-section-head">
			<h2 class="home-section-title">Services</h2>
			<!-- <button class="sprd-btn sprd-btn--ghost sprd-btn--sm" onclick={() => goto('/products')}>
				Lihat Semua<RiArrowRightLine class="inline-block h-4 w-4 ml-1" />
			</button> -->
		</div>

		<div class="home-cats">
			{#each CATEGORY_TILES as cat (cat.id)}
				<button
					class="home-cat"
					style="background: {cat.bg}; color: {cat.fg};"
					onclick={() => goto('/products')}
				>
					{#if cat.id === 'design'}
						<RiPenNibLine class="h-7 w-7" />
					{:else if cat.id === 'video'}
						<RiVideoLine class="h-7 w-7" />
					{:else if cat.id === 'bumper'}
						<RiSparkling2Line class="h-7 w-7" />
					{/if}
					<div>
						<div class="home-cat-label">{cat.label}</div>
						<div class="home-cat-sub">{cat.sub}</div>
					</div>
					<div class="home-cat-count"></div>
				</button>
			{/each}
		</div>
	</section>

	<!-- ══ RECENT WORK ═══════════════════════════════════════════════ -->
	<!-- <section class="home-section">
		<div class="home-section-head">
			<h2 class="home-section-title">Recent work</h2>
			<span
				class="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium"
				style="background: oklch(0.92 0.003 248); color: var(--muted-foreground);"
			>
				{PORTFOLIO.length} projects
			</span>
		</div>

		<div class="home-portfolio-grid">
			{#each PORTFOLIO as item (item.id)}
				<div class="home-portfolio-card">
					<div class="home-portfolio-thumb" style="background: {item.tint};">
						{#if item.category === 'branding'}
							<RiSparkling2Line class="h-10 w-10 text-white/90" />
						{:else if item.category === 'video'}
							<RiVideoLine class="h-10 w-10 text-white/90" />
						{:else}
							<RiPenNibLine class="h-10 w-10 text-white/90" />
						{/if}
					</div>
					<div class="home-portfolio-body">
						<div class="home-portfolio-client">{item.client}</div>
						<div class="home-portfolio-project">{item.project}</div>
						<div class="home-portfolio-foot">
							<span
								class="inline-flex h-5 items-center rounded-full px-2.5 text-[11px] font-medium capitalize {CAT_BADGE[
									item.category
								] ?? ''}"
							>
								{item.category}
							</span>
							<div class="home-portfolio-result">
								<RiArrowUpLine class="h-3 w-3" />
								{item.result}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section> -->

	<!-- ══ FEATURED SERVICES ═════════════════════════════════════════ -->
	<section class="home-section">
		<div class="home-section-head">
			<h2 class="home-section-title">Favorite Services</h2>
			<button class="sprd-btn sprd-btn--ghost sprd-btn--sm" onclick={() => goto('/products')}>
				Browse<RiArrowRightLine class="ml-1 inline-block h-4 w-4" />
			</button>
		</div>

		{#await data.productsPromise}
			<!-- Loading skeletons -->
			<div class="home-products-grid">
				{#each Array(3) as _}
					<div
						class="home-prod-card"
						style="box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08), var(--shadow-xs);"
					>
						<Skeleton class="h-[100px] w-full rounded-none" />
						<div class="home-prod-body gap-2">
							<Skeleton class="h-3 w-16" />
							<Skeleton class="h-4 w-3/4" />
							<div class="home-prod-foot">
								<Skeleton class="h-4 w-24" />
								<Skeleton class="h-3 w-12" />
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:then res}
			{#if res.error || !res.products.length}
				<div
					class="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-16 text-muted-foreground"
					style="border-color: oklch(0.6 0 0 / .4);"
				>
					<RiSparkling2Line class="h-8 w-8 opacity-40" />
					<p class="text-sm">Services coming soon.</p>
				</div>
			{:else}
				{@const featured = res.products}
				<div class="home-products-grid">
					{#each featured as product (product.id)}
						<button class="home-prod-card text-left" onclick={() => goto('/products')}>
							<!-- Thumb: image or fallback -->
							<div
								class="home-prod-thumb"
								style={!product.imageUrl ? 'background: var(--secondary);' : ''}
							>
								{#if product.imageUrl}
									<img
										src={resolveImg(product.imageUrl)}
										alt={product.name}
										class="h-full w-full object-cover"
									/>
								{:else}
									<RiSparkling2Line class="h-[34px] w-[34px] text-white/90" />
								{/if}
							</div>
							<div class="home-prod-body">
								<div class="home-prod-cat">Service</div>
								<div class="home-prod-name">{product.name}</div>
								<div class="home-prod-foot">
									<div class="home-prod-price">{formatPrice(product.price)}</div>
									<div class="home-prod-rating">
										<RiStarFill class="h-3 w-3" style="color: var(--primary);" />
										<span>4.8</span>
									</div>
								</div>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		{:catch}
			<p class="text-sm text-destructive">Failed to load services.</p>
		{/await}
	</section>

	<!-- ══ TESTIMONIALS ══════════════════════════════════════════════ -->
	<section class="home-section">
		<div class="home-section-head">
			<h2 class="home-section-title">Reviews</h2>
			<span
				class="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-medium"
				style="background: oklch(0.70 0.15 162 / 0.12); color: var(--chart-4);"
			>
				<RiStarFill class="h-3 w-3" />
				40+ reviews
			</span>
		</div>

		{#await data.reviewsPromise}
			<!-- Loading skeleton for testimonials -->
			<div class="home-testimonials-grid">
				{#each Array(4) as _}
					<div class="home-testimonial">
						<Skeleton class="mb-2 h-4 w-24" />
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-5/6" />
						<div class="home-testi-author mt-4">
							<Skeleton class="h-9 w-9 rounded-full" />
							<div class="flex-1 space-y-2">
								<Skeleton class="h-3 w-20" />
								<Skeleton class="h-3 w-16" />
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:then res}
			{@const dbReviews =
				res && res.reviews
					? res.reviews.map((r: any) => ({
							id: r.id,
							user_name: r.user?.full_name || 'Customer',
							user_initial: r.user?.full_name
								? r.user.full_name.substring(0, 2).toUpperCase()
								: 'CU',
							company: 'Verified Buyer', // Since backend Review model doesn't store company
							rating: r.rating,
							comment: r.comment
						}))
					: []}
			{@const mergedReviews = [...dbReviews, ...TESTIMONIALS].slice(0, 4)}

			<div class="home-testimonials-grid">
				{#each mergedReviews as t (t.id)}
					<div class="home-testimonial">
						<div class="home-testi-stars">
							{#each Array(t.rating) as _}
								<RiStarFill class="h-3.5 w-3.5" />
							{/each}
						</div>
						<p class="home-testi-text">&ldquo;{t.comment}&rdquo;</p>
						<div class="home-testi-author">
							<div class="home-testi-avatar">{t.user_initial}</div>
							<div>
								<div class="home-testi-name">{t.user_name}</div>
								<div class="home-testi-company">{t.company}</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:catch}
			<div class="home-testimonials-grid">
				{#each TESTIMONIALS.slice(0, 4) as t (t.id)}
					<div class="home-testimonial">
						<div class="home-testi-stars">
							{#each Array(t.rating) as _}
								<RiStarFill class="h-3.5 w-3.5" />
							{/each}
						</div>
						<p class="home-testi-text">&ldquo;{t.comment}&rdquo;</p>
						<div class="home-testi-author">
							<div class="home-testi-avatar">{t.user_initial}</div>
							<div>
								<div class="home-testi-name">{t.user_name}</div>
								<div class="home-testi-company">{t.company}</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/await}
	</section>

	<!-- ══ CTA BANNER ════════════════════════════════════════════════ -->
	<div class="home-cta-banner">
		<div class="home-cta-text">
			<h2>Siap Bikin Konten Kamu Makin Keren?</h2>
			<p>Pilih layanan editing dan tim kreatif kami akan langsung mengeksekusinya.</p>
		</div>
		<div class="mt-2 flex w-full shrink-0 flex-wrap gap-2.5 sm:mt-0 sm:w-auto">
			<button class="sprd-btn sprd-btn--default sprd-btn--lg" onclick={() => goto('/products')}>
				Order Now <RiArrowRightLine class="ml-1 inline-block h-5 w-5" />
			</button>
		</div>
	</div>
</div>

<style>
	/* ── Page shell ── */
	.home-page {
		padding: 32px 28px 80px;
		width: 100%;
		height: 100%;
	}

	/* ── Hero ── */
	.home-hero {
		display: grid;
		grid-template-columns: 1.6fr 1fr;
		gap: 24px;
		background: var(--card);
		border-radius: 16px;
		padding: 40px 36px;
		box-shadow:
			inset 0 0 0 1px oklch(0 0 0 / 0.08),
			var(--shadow-xs);
		margin-bottom: 40px;
		overflow: hidden;
	}

	.home-hero-eyebrow {
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted-foreground);
		margin-bottom: 16px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.home-hero-eyebrow-dash {
		width: 24px;
		height: 2px;
		background: var(--primary);
		border-radius: 2px;
		flex-shrink: 0;
	}

	.home-hero-h1 {
		font-family: 'Space Grotesk', system-ui, sans-serif;
		font-size: 46px;
		line-height: 1.02;
		font-weight: 700;
		letter-spacing: -0.04em;
		margin: 0 0 16px;
	}

	.home-hero-h1-accent {
		color: var(--primary);
	}

	.home-hero-sub {
		font-size: 15px;
		color: var(--muted-foreground);
		line-height: 1.6;
		max-width: 400px;
		margin: 0 0 26px;
	}

	.home-hero-cta {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	/* Hero right panel */
	.home-hero-panel {
		background: var(--secondary);
		border-radius: 14px;
		padding: 22px;
		color: #fff;
		display: flex;
		flex-direction: column;
		gap: 20px;
		position: relative;
		overflow: hidden;
	}

	.home-hero-panel::before {
		content: '';
		position: absolute;
		bottom: -30px;
		right: -30px;
		width: 150px;
		height: 150px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.04);
	}

	.home-panel-logo {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 9px;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.home-stat-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}

	.home-stat-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.home-stat-value--accent {
		color: var(--primary);
	}

	.home-stat-label {
		font-size: 10.5px;
		color: rgba(255, 255, 255, 0.6);
		margin-top: 4px;
		line-height: 1.3;
	}

	.home-panel-note {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
		line-height: 1.5;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding-top: 14px;
		margin-top: auto;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	/* ── Sections ── */
	.home-section {
		margin-top: 40px;
	}

	.home-section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.home-section-title {
		font-size: 18px;
		font-weight: 600;
		letter-spacing: -0.02em;
		margin: 0;
	}

	/* ── Category tiles ── */
	.home-cats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}

	.home-cat {
		border-radius: 14px;
		padding: 24px 20px;
		border: none;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 12px;
		text-align: left;
		font-family: inherit;
		transition:
			transform 0.15s,
			box-shadow 0.15s;
		min-height: 168px;
	}

	.home-cat:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}

	.home-cat-label {
		font-size: 17px;
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	.home-cat-sub {
		font-size: 12px;
		opacity: 0.82;
		line-height: 1.5;
		margin-top: 2px;
	}

	.home-cat-count {
		font-size: 11px;
		font-family: 'JetBrains Mono', monospace;
		opacity: 0.7;
		margin-top: auto;
	}

	/* ── Portfolio grid ── */
	.home-portfolio-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}

	.home-portfolio-card {
		background: var(--card);
		border-radius: 14px;
		overflow: hidden;
		box-shadow:
			inset 0 0 0 1px oklch(0 0 0 / 0.08),
			var(--shadow-xs);
		transition: all 0.15s;
		display: flex;
		flex-direction: column;
	}

	.home-portfolio-card:hover {
		transform: translateY(-2px);
		box-shadow:
			inset 0 0 0 1px oklch(0 0 0 / 0.1),
			var(--shadow-sm);
	}

	.home-portfolio-thumb {
		height: 118px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.home-portfolio-body {
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
	}

	.home-portfolio-client {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.home-portfolio-project {
		font-size: 14px;
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 1.3;
	}

	.home-portfolio-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: auto;
		padding-top: 10px;
	}

	.home-portfolio-result {
		font-size: 11px;
		font-weight: 600;
		color: var(--chart-4);
		display: flex;
		align-items: center;
		gap: 3px;
	}

	/* ── Featured products grid ── */
	.home-products-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}

	.home-prod-card {
		background: var(--card);
		border-radius: 14px;
		overflow: hidden;
		box-shadow:
			inset 0 0 0 1px oklch(0 0 0 / 0.08),
			var(--shadow-xs);
		cursor: pointer;
		transition: all 0.15s;
		display: flex;
		flex-direction: column;
		border: none;
		font-family: inherit;
	}

	.home-prod-card:hover {
		transform: translateY(-2px);
		box-shadow:
			inset 0 0 0 1px oklch(0 0 0 / 0.1),
			var(--shadow-sm);
	}

	.home-prod-thumb {
		height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.home-prod-body {
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 5px;
		flex: 1;
	}

	.home-prod-cat {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.home-prod-name {
		font-size: 14px;
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 1.3;
		text-align: left;
		color: var(--foreground);
	}

	.home-prod-foot {
		margin-top: auto;
		padding-top: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.home-prod-price {
		font-family: 'JetBrains Mono', monospace;
		font-size: 13px;
		font-weight: 700;
	}

	.home-prod-rating {
		display: flex;
		align-items: center;
		gap: 3px;
		font-size: 11px;
		color: var(--muted-foreground);
	}

	/* ── Testimonials ── */
	.home-testimonials-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 14px;
	}

	.home-testimonial {
		background: var(--card);
		border-radius: 14px;
		padding: 22px;
		box-shadow:
			inset 0 0 0 1px oklch(0 0 0 / 0.08),
			var(--shadow-xs);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.home-testi-stars {
		display: flex;
		gap: 2px;
		color: var(--primary);
	}

	.home-testi-text {
		font-size: 13.5px;
		line-height: 1.65;
		color: var(--foreground);
		flex: 1;
		margin: 0;
	}

	.home-testi-author {
		display: flex;
		align-items: center;
		gap: 10px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
		margin-top: auto;
	}

	.home-testi-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: oklch(0.86 0.17 91 / 0.15);
		color: oklch(0.45 0.15 80);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 700;
		flex-shrink: 0;
	}

	.home-testi-name {
		font-size: 13px;
		font-weight: 600;
	}

	.home-testi-company {
		font-size: 11px;
		color: var(--muted-foreground);
	}

	/* ── CTA Banner ── */
	.home-cta-banner {
		margin-top: 40px;
		background: var(--secondary);
		border-radius: 16px;
		padding: 40px 36px;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		position: relative;
		overflow: hidden;
	}

	.home-cta-banner::before {
		content: '';
		position: absolute;
		right: -60px;
		top: -60px;
		width: 200px;
		height: 200px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.04);
	}

	.home-cta-text h2 {
		font-family: 'Space Grotesk', system-ui, sans-serif;
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.03em;
		margin: 0 0 8px;
	}

	.home-cta-text p {
		font-size: 14px;
		opacity: 0.7;
		margin: 0;
		line-height: 1.5;
	}

	/* ── Shared button primitives ── */
	.sprd-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		height: 36px;
		padding: 0 14px;
		border-radius: 6.5px;
		font-family: inherit;
		font-size: 14px;
		font-weight: 500;
		letter-spacing: -0.01em;
		border: 1px solid transparent;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.sprd-btn:active:not(:disabled) {
		transform: translateY(1px);
	}

	.sprd-btn--default {
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.sprd-btn--default:hover {
		background: oklch(0.86 0.17 91 / 0.82);
	}

	.sprd-btn--outline {
		background: var(--background);
		color: var(--foreground);
		border-color: var(--border);
		box-shadow: var(--shadow-xs);
	}

	.sprd-btn--outline:hover {
		background: oklch(0.94 0.003 248);
	}

	.sprd-btn--ghost {
		background: transparent;
		color: var(--foreground);
	}

	.sprd-btn--ghost:hover {
		background: oklch(0.92 0.003 248);
	}

	.sprd-btn--sm {
		height: 30px;
		padding: 0 10px;
		font-size: 13px;
	}

	.sprd-btn--lg {
		height: 44px;
		padding: 0 20px;
		font-size: 15px;
	}

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.home-hero {
			grid-template-columns: 1fr;
		}

		.home-hero-h1 {
			font-size: 36px;
		}

		.home-cats,
		.home-products-grid {
			grid-template-columns: 1fr 1fr;
		}

		.home-portfolio-grid {
			grid-template-columns: 1fr 1fr;
		}

		.home-testimonials-grid {
			grid-template-columns: 1fr;
		}

		.home-cta-banner {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 600px) {
		.home-page {
			padding-left: 16px;
			padding-right: 16px;
		}

		.home-cats,
		.home-products-grid,
		.home-portfolio-grid {
			grid-template-columns: 1fr;
		}

		.home-cta-banner {
			padding: 32px 24px;
		}
	}
</style>
