<script lang="ts">
	import { RiStarFill, RiStarLine, RiEyeLine, RiEyeOffLine, RiCheckLine, RiCloseLine, RiLoader4Line } from 'remixicon-svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
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
					const reviewedOrderIds = new Set(myReviews.map(r => r.order_id));
					pendingOrders = (res.completedOrders || []).filter((o: any) => !reviewedOrderIds.has(o.id));
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
			pendingOrders = pendingOrders.filter(o => o.id !== selectedOrderId);
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
		isToggling[reviewId] = true;
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

			// Update local state
			const index = adminReviews.findIndex(r => r.id === reviewId);
			if (index !== -1) {
				adminReviews[index] = { ...adminReviews[index], show: !currentStatus };
			}
			toast.success(`Review is now ${!currentStatus ? 'visible' : 'hidden'}`);
		} catch (e) {
			toast.error('Network error. Please try again.');
		} finally {
			isToggling[reviewId] = false;
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
				{data.isAdmin ? 'Manage visibility of all user reviews.' : 'View your submitted reviews and pending items.'}
			</p>
		</div>

		{#await data.reviewsPromise}
			<div class="flex flex-col items-center gap-3 py-20 text-sm text-muted-foreground">
				<div class="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"></div>
				Loading reviews...
			</div>
		{:then res}
			{#if res.error}
				<div class="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive">
					{res.error}
				</div>
			{:else}
				{#if data.isAdmin}
					<!-- ADMIN VIEW -->
					<div class="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
						{#if adminReviews.length === 0}
							<div class="p-16 text-center text-sm text-muted-foreground">
								No reviews found for any product.
							</div>
						{:else}
							<div class="overflow-x-auto">
								<table class="w-full text-left text-sm">
									<thead class="border-b bg-muted/20">
										<tr>
											<th class="px-6 py-4 font-semibold text-muted-foreground">User</th>
											<th class="px-6 py-4 font-semibold text-muted-foreground">Product</th>
											<th class="px-6 py-4 font-semibold text-muted-foreground">Rating & Comment</th>
											<th class="px-6 py-4 font-semibold text-muted-foreground text-right">Visibility</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-border/60">
										{#each adminReviews as review}
											<tr class="transition-colors hover:bg-muted/30 {review.show ? '' : 'opacity-60'}">
												<td class="px-6 py-4 align-top">
													<div class="font-medium text-foreground">{review.user_name}</div>
													<div class="text-xs text-muted-foreground mt-1">{formatDate(review.created_at)}</div>
												</td>
												<td class="px-6 py-4 align-top">
													<span class="inline-flex items-center rounded-md bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary">
														{review.productName}
													</span>
												</td>
												<td class="px-6 py-4 max-w-sm">
													<div class="flex gap-0.5 text-primary mb-2">
														{#each Array(5) as _, i}
															{#if i < review.rating}
																<RiStarFill class="h-4 w-4" />
															{:else}
																<RiStarLine class="h-4 w-4 opacity-30" />
															{/if}
														{/each}
													</div>
													<p class="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
												</td>
												<td class="px-6 py-4 align-top text-right">
													<button
														class="sprd-btn {review.show ? 'sprd-btn--outline' : 'sprd-btn--secondary'} sprd-btn--sm min-w-[90px]"
														onclick={() => toggleVisibility(review.id, review.show)}
														disabled={isToggling[review.id]}
													>
														{#if isToggling[review.id]}
															<RiLoader4Line class="h-4 w-4 animate-spin" />
														{:else}
															{#if review.show}
																<RiEyeOffLine class="h-4 w-4 mr-1.5" /> Hide
															{:else}
																<RiEyeLine class="h-4 w-4 mr-1.5" /> Show
															{/if}
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
					<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
						
						<!-- Left Col: My Reviews -->
						<div class="lg:col-span-2 space-y-4">
							<h2 class="text-lg font-semibold tracking-tight">Published Reviews</h2>
							
							{#if myReviews.length === 0}
								<div class="bg-card rounded-[14px] p-8 text-center text-sm text-muted-foreground border border-dashed border-border/60">
									You haven't submitted any reviews yet.
								</div>
							{:else}
								<div class="space-y-4">
									{#each myReviews as review}
										{@const order = allOrders.find(o => o.id === review.order_id) || {}}
										<div class="bg-card rounded-[14px] p-5 shadow-xs border">
											<div class="flex justify-between items-start mb-4">
												<div>
													<div class="font-bold text-base mb-1">{order.product?.name || `Order #${(review.order_id || '').substring(0,8).toUpperCase()}`}</div>
													<div class="text-xs text-muted-foreground font-mono">Purchased on {formatDate(order.created_at || review.created_at)}</div>
												</div>
												{#if order.ordered_price || order.price}
													<div class="text-sm font-mono text-primary font-semibold">{formatPrice(order.ordered_price || order.price)}</div>
												{/if}
											</div>
											<div class="w-full h-px bg-border/60 mb-4"></div>
											<div class="flex justify-between items-center mb-3">
												<div class="flex gap-1 text-primary">
													{#each Array(5) as _, i}
														{#if i < review.rating}
															<RiStarFill class="h-4 w-4" />
														{:else}
															<RiStarLine class="h-4 w-4 opacity-30" />
														{/if}
													{/each}
												</div>
												<span class="text-xs text-muted-foreground font-mono">Reviewed on {formatDate(review.created_at)}</span>
											</div>
											<p class="text-sm text-foreground leading-relaxed">{review.comment}</p>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Right Col: Pending Reviews Sidepanel Equivalent -->
						<div class="space-y-4">
							<h2 class="text-lg font-semibold tracking-tight">Pending Reviews</h2>
							
							{#if pendingOrders.length === 0}
								<div class="bg-card rounded-[14px] p-6 text-center text-sm text-muted-foreground shadow-xs border">
									<div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-secondary">
										<RiCheckLine class="h-6 w-6" />
									</div>
									You're all caught up! No pending reviews.
								</div>
							{:else}
								<div class="space-y-4">
									{#each pendingOrders as order}
										<div class="bg-card rounded-[14px] p-5 shadow-xs border border-primary/20 bg-primary/5">
											<div class="mb-3">
												<div class="flex justify-between items-start mb-2">
													<span class="inline-flex items-center rounded-md bg-[var(--chart-4)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--chart-4)] uppercase tracking-wider">
														Completed
													</span>
													<span class="text-xs text-muted-foreground font-mono">{formatDate(order.created_at)}</span>
												</div>
												<div class="font-bold text-base mb-1">{order.product?.name || `Order #${order.id?.substring(0,8).toUpperCase() || 'Unknown'}`}</div>
												<div class="text-sm font-mono text-primary font-semibold">{formatPrice(order.ordered_price || order.price || 0)}</div>
											</div>
											
											<button 
												class="sprd-btn sprd-btn--default w-full text-sm mt-2"
												onclick={() => selectedOrderId = order.id}
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
			{/if}
		{/await}
	</div>
</div>

<!-- Create Review Slide-over Panel (For User) -->
{#if selectedOrderId}
	<div class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onclick={() => selectedOrderId = null}></div>
	<div class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col transition-transform">
		<div class="flex items-center justify-between px-6 py-4 border-b border-border">
			<h2 class="text-base font-semibold text-foreground">Write a Review</h2>
			<button class="p-2 -mr-2 text-muted-foreground hover:bg-secondary/10 rounded-lg" onclick={() => selectedOrderId = null}>
				<RiCloseLine class="h-5 w-5" />
			</button>
		</div>

		<div class="flex-1 overflow-y-auto p-6 space-y-6">
			<div class="space-y-2">
				<label class="text-sm font-semibold text-foreground">Rating</label>
				<div class="flex gap-2 text-primary text-2xl">
					{#each Array(5) as _, i}
						<button 
							class="hover:scale-110 transition-transform bg-transparent border-none cursor-pointer p-0"
							onclick={() => rating = i + 1}
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
					class="w-full min-h-[120px] rounded-xl border border-border bg-transparent p-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
					placeholder="Tell us what you think..."
					bind:value={comment}
				></textarea>
			</div>
		</div>

		<div class="p-6 border-t border-border bg-card">
			<button 
				class="sprd-btn sprd-btn--default w-full h-12 text-base disabled:opacity-50"
				onclick={submitReview}
				disabled={isCreatingReview || !comment.trim()}
			>
				{#if isCreatingReview}
					<RiLoader4Line class="h-5 w-5 animate-spin mr-2" /> Submitting...
				{:else}
					Submit Review
				{/if}
			</button>
		</div>
	</div>
{/if}
