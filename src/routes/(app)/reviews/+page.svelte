<script lang="ts">
	import {
		RiStarFill,
		RiStarLine,
		RiEyeLine,
		RiEyeOffLine,
		RiCheckLine,
		RiCloseLine,
		RiLoader4Line
	} from 'remixicon-svelte';
	import { toast } from 'svelte-sonner';
	import { formatDate } from '$lib/api_utils';
	import { formatPrice } from '$lib/string_utils';

	let { data } = $props();

	// --- User State ---
	let allOrders = $state<any[]>([]);
	let pendingOrders = $state<any[]>([]);
	let myReviews = $state<any[]>([]);
	let isCreatingReview = $state(false);

	// Review creation form
	let selectedOrderId = $state<string | null>(null);
	let rating = $state(5);
	let comment = $state('');

	// --- Admin State ---
	let adminReviews = $state<any[]>([]);
	let isToggling = $state<Record<string, boolean>>({});

	// Initialize state based on fetched data
	$effect(() => {
		data.reviewsPromise.then((res: any) => {
			if (res && !res.error) {
				if (data.isAdmin) {
					adminReviews = res.reviews || [];
				} else {
					allOrders = res.allOrders || [];
					myReviews = res.myReviews || [];
					// Match completed orders that don't have a review
					const reviewedOrderIds = new Set(myReviews.map((r) => r.order_id));
					pendingOrders = (res.completedOrders || []).filter(
						(o: any) => !reviewedOrderIds.has(o.id)
					);
				}
			}
		});
	});

	// --- User Functions ---
	async function submitReview() {
		if (!selectedOrderId || !rating || !comment) {
			toast.error('Please fill in all fields');
			return;
		}

		isCreatingReview = true;
		try {
			const res = await fetch('/api/reviews/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					order_id: selectedOrderId,
					rating,
					comment
				})
			});

			const result = await res.json();
			if (!res.ok) {
				toast.error(result.error || 'Failed to submit review');
				return;
			}

			toast.success('Review submitted successfully!');

			// Update local state without refetching
			pendingOrders = pendingOrders.filter((o) => o.id !== selectedOrderId);
			myReviews = [result.data, ...myReviews];

			// Reset form
			selectedOrderId = null;
			rating = 5;
			comment = '';
		} catch (e) {
			toast.error('Network error. Please try again.');
		} finally {
			isCreatingReview = false;
		}
	}

	// --- Admin Functions ---
	async function toggleVisibility(reviewId: string, currentStatus: boolean) {
		isToggling = { ...isToggling, [reviewId]: true };
		try {
			const res = await fetch(`/api/reviews/show-status/${reviewId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ show: !currentStatus })
			});

			const result = await res.json();
			if (!res.ok) {
				toast.error(result.error || 'Failed to update visibility');
				return;
			}

			// Update local state with deep copy to guarantee Svelte 5 reactivity
			const index = adminReviews.findIndex((r) => r.id === reviewId);
			if (index !== -1) {
				const newReviews = [...adminReviews];
				newReviews[index] = { ...newReviews[index], show: !currentStatus };
				adminReviews = newReviews;
			}
			toast.success(`Review is now ${!currentStatus ? 'visible' : 'hidden'}`);
		} catch (e) {
			toast.error('Network error. Please try again.');
		} finally {
			isToggling = { ...isToggling, [reviewId]: false };
		}
	}
</script>

<div class="min-h-0 w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
	<div class="mx-auto w-full max-w-6xl space-y-6">
		<div class="flex flex-col gap-1">
			<h1 class="font-sans text-2xl font-semibold tracking-tight text-foreground">
				{data.isAdmin ? 'Review Management' : 'My Reviews'}
			</h1>
			<p class="text-sm text-muted-foreground">
				{data.isAdmin
					? 'Manage visibility of all user reviews.'
					: 'View your submitted reviews and pending items.'}
			</p>
		</div>

		{#await data.reviewsPromise}
			<div class="flex flex-col items-center gap-3 py-20 text-sm text-muted-foreground">
				<div
					class="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"
				></div>
				Loading reviews...
			</div>
		{:then res}
			{#if data.isAdmin}
				<!-- ADMIN VIEW -->
				<div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
					{#if adminReviews.length === 0}
						<div class="p-16 text-center text-sm text-muted-foreground">
							No reviews found for any product.
						</div>
					{:else}
						<!-- Mobile View (Cards) -->
						<div class="block divide-y divide-border/60 md:hidden">
							{#each adminReviews as review}
								<div
									class="p-4 transition-colors hover:bg-muted/30 {review.show
										? ''
										: 'opacity-60'} flex flex-col gap-3"
								>
									<div class="flex items-start justify-between">
										<div>
											<div class="font-medium text-foreground">{review.user_name}</div>
											<div class="mt-0.5 text-xs text-muted-foreground">
												{formatDate(review.created_at)}
											</div>
										</div>
										<span
											class="inline-flex max-w-[120px] items-center truncate rounded-md bg-secondary/10 px-2 py-1 text-[10px] font-medium text-secondary"
										>
											{review.productName}
										</span>
									</div>
									<div>
										<div class="mb-1.5 flex gap-0.5 text-primary">
											{#each Array(5) as _, i}
												{#if i < review.rating}
													<RiStarFill class="h-3.5 w-3.5" />
												{:else}
													<RiStarLine class="h-3.5 w-3.5 opacity-30" />
												{/if}
											{/each}
										</div>
										<p class="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
									</div>
									<div class="mt-2 flex justify-end">
										<button
											class="sprd-btn {review.show
												? 'sprd-btn--outline'
												: 'sprd-btn--secondary'} sprd-btn--sm w-full sm:w-auto"
											onclick={() => toggleVisibility(review.id, review.show)}
											disabled={isToggling[review.id]}
										>
											{#if isToggling[review.id]}
												<RiLoader4Line class="h-4 w-4 animate-spin" />
											{:else if review.show}
												<RiEyeOffLine class="h-4 w-4" /> Hide
											{:else}
												<RiEyeLine class="h-4 w-4" /> Show
											{/if}
										</button>
									</div>
								</div>
							{/each}
						</div>

						<!-- Desktop View (Table) -->
						<div class="hidden overflow-x-auto md:block">
							<table class="w-full text-left text-sm">
								<thead class="border-b bg-muted/20">
									<tr>
										<th class="px-6 py-4 font-semibold text-muted-foreground">User</th>
										<th class="px-6 py-4 font-semibold text-muted-foreground">Product</th>
										<th class="px-6 py-4 font-semibold text-muted-foreground">Rating & Comment</th>
										<th class="px-6 py-4 text-right font-semibold text-muted-foreground"
											>Visibility</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-border/60">
									{#each adminReviews as review}
										<tr
											class="transition-colors hover:bg-muted/30 {review.show ? '' : 'opacity-60'}"
										>
											<td class="px-6 py-4 align-top">
												<div class="font-medium text-foreground">{review.user_name}</div>
												<div class="mt-1 text-xs text-muted-foreground">
													{formatDate(review.created_at)}
												</div>
											</td>
											<td class="px-6 py-4 align-top">
												<span
													class="inline-flex items-center rounded-md bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary"
												>
													{review.productName}
												</span>
											</td>
											<td class="max-w-sm px-6 py-4">
												<div class="mb-2 flex gap-0.5 text-primary">
													{#each Array(5) as _, i}
														{#if i < review.rating}
															<RiStarFill class="h-4 w-4" />
														{:else}
															<RiStarLine class="h-4 w-4 opacity-30" />
														{/if}
													{/each}
												</div>
												<p class="text-sm leading-relaxed text-muted-foreground">
													{review.comment}
												</p>
											</td>
											<td class="px-6 py-4 text-right align-top">
												<button
													class="sprd-btn {review.show
														? 'sprd-btn--outline'
														: 'sprd-btn--secondary'} sprd-btn--sm min-w-[90px]"
													onclick={() => toggleVisibility(review.id, review.show)}
													disabled={isToggling[review.id]}
												>
													{#if isToggling[review.id]}
														<RiLoader4Line class="h-4 w-4 animate-spin" />
													{:else if review.show}
														<RiEyeOffLine class="h-4 w-4" /> Hide
													{:else}
														<RiEyeLine class="h-4 w-4" /> Show
													{/if}
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			{:else}
				<!-- USER VIEW -->
				<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<!-- Left Col: My Reviews -->
					<div class="space-y-4 lg:col-span-2">
						<h2 class="text-lg font-semibold tracking-tight">Published Reviews</h2>

						{#if myReviews.length === 0}
							<div
								class="rounded-[14px] border border-dashed border-border/60 bg-card p-8 text-center text-sm text-muted-foreground"
							>
								You haven't submitted any reviews yet.
							</div>
						{:else}
							<div class="space-y-4">
								{#each myReviews as review}
									{@const order = allOrders.find((o) => o.id === review.order_id) || {}}
									<div class="rounded-[14px] border bg-card p-5 shadow-xs">
										<div class="mb-4 flex items-start justify-between">
											<div>
												<div class="mb-1 text-base font-bold">
													{order.product?.name ||
														`Order #${(review.order_id || '').substring(0, 8).toUpperCase()}`}
												</div>
												<div class="font-mono text-xs text-muted-foreground">
													Purchased on {formatDate(order.created_at || review.created_at)}
												</div>
											</div>
											{#if order.ordered_price || order.price}
												<div class="font-mono text-sm font-semibold text-primary">
													{formatPrice(order.ordered_price || order.price)}
												</div>
											{/if}
										</div>
										<div class="mb-4 h-px w-full bg-border/60"></div>
										<div class="mb-3 flex items-center justify-between">
											<div class="flex gap-1 text-primary">
												{#each Array(5) as _, i}
													{#if i < review.rating}
														<RiStarFill class="h-4 w-4" />
													{:else}
														<RiStarLine class="h-4 w-4 opacity-30" />
													{/if}
												{/each}
											</div>
											<span class="font-mono text-xs text-muted-foreground"
												>Reviewed on {formatDate(review.created_at)}</span
											>
										</div>
										<p class="text-sm leading-relaxed text-foreground">{review.comment}</p>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Right Col: Pending Reviews Sidepanel Equivalent -->
					<div class="space-y-4">
						<h2 class="text-lg font-semibold tracking-tight">Pending Reviews</h2>

						{#if pendingOrders.length === 0}
							<div
								class="rounded-[14px] border bg-card p-6 text-center text-sm text-muted-foreground shadow-xs"
							>
								<div
									class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary"
								>
									<RiCheckLine class="h-6 w-6" />
								</div>
								You're all caught up! No pending reviews.
							</div>
						{:else}
							<div class="space-y-4">
								{#each pendingOrders as order}
									<div
										class="rounded-[14px] border border-primary/20 bg-card bg-primary/5 p-5 shadow-xs"
									>
										<div class="mb-3">
											<div class="mb-2 flex items-start justify-between">
												<span
													class="inline-flex items-center rounded-md bg-[var(--chart-4)]/10 px-2 py-0.5 text-xs font-semibold tracking-wider text-[var(--chart-4)] uppercase"
												>
													Completed
												</span>
												<span class="font-mono text-xs text-muted-foreground"
													>{formatDate(order.created_at)}</span
												>
											</div>
											<div class="mb-1 text-base font-bold">
												{order.product?.name ||
													`Order #${order.id?.substring(0, 8).toUpperCase() || 'Unknown'}`}
											</div>
											<div class="font-mono text-sm font-semibold text-primary">
												{formatPrice(order.ordered_price || order.price || 0)}
											</div>
										</div>

										<button
											class="sprd-btn sprd-btn--default mt-2 w-full text-sm"
											onclick={() => (selectedOrderId = order.id)}
										>
											Create Review
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		{/await}
	</div>
</div>

<!-- Create Review Slide-over Panel (For User) -->
{#if selectedOrderId}
	<div
		class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
		onclick={() => (selectedOrderId = null)}
	></div>
	<div
		class="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl transition-transform"
	>
		<div class="flex items-center justify-between border-b border-border px-6 py-4">
			<h2 class="text-base font-semibold text-foreground">Write a Review</h2>
			<button
				class="-mr-2 rounded-lg p-2 text-muted-foreground hover:bg-secondary/10"
				onclick={() => (selectedOrderId = null)}
			>
				<RiCloseLine class="h-5 w-5" />
			</button>
		</div>

		<div class="flex-1 space-y-6 overflow-y-auto p-6">
			<div class="space-y-2">
				<label class="text-sm font-semibold text-foreground">Rating</label>
				<div class="flex gap-2 text-2xl text-primary">
					{#each Array(5) as _, i}
						<button
							class="cursor-pointer border-none bg-transparent p-0 transition-transform hover:scale-110"
							onclick={() => (rating = i + 1)}
						>
							{#if i < rating}
								<RiStarFill class="h-8 w-8" />
							{:else}
								<RiStarLine class="h-8 w-8 opacity-30" />
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-semibold text-foreground">Your Comment</label>
				<textarea
					class="min-h-[120px] w-full resize-none rounded-xl border border-border bg-transparent p-4 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
					placeholder="Tell us what you think..."
					bind:value={comment}
				></textarea>
			</div>
		</div>

		<div class="border-t border-border bg-card p-6">
			<button
				class="sprd-btn sprd-btn--default h-12 w-full text-base disabled:opacity-50"
				onclick={submitReview}
				disabled={isCreatingReview || !comment.trim()}
			>
				{#if isCreatingReview}
					<RiLoader4Line class="mr-2 h-5 w-5 animate-spin" /> Submitting...
				{:else}
					Submit Review
				{/if}
			</button>
		</div>
	</div>
{/if}
