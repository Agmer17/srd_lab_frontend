<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { formatDate } from '$lib/api_utils';
	import { formatPrice, initials } from '$lib/string_utils';
	import type { Order } from '$lib/types/order';
	import { MediaQuery } from 'svelte/reactivity';
	import Skeleton from '../ui/skeleton/skeleton.svelte';

	let {
		open = $bindable(false),
		order,
		onStatusChange,
		statusUpdating = false,
		isLoading = true,
		showChangeButton = false
	}: {
		open: boolean;
		order: Order | null;
		onStatusChange: (id: string | undefined, status: string) => void;
		statusUpdating?: boolean;
		isLoading?: boolean;
		showChangeButton?: boolean;
	} = $props();

	const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'] as const;

	// Track pending status change — requires explicit Save + Confirm before firing onStatusChange
	let selectedStatus = $derived(order?.status ?? 'pending');
	let pendingStatus = $state<string | null>(null);
	let confirmingChange = $state(false);

	function handleSelectChange(value: string) {
		selectedStatus = value;
		pendingStatus = value !== order?.status ? value : null;
	}

	function handleSave() {
		if (!pendingStatus) return;
		confirmingChange = true;
	}

	async function handleConfirm() {
		if (!pendingStatus || !order) return;
		onStatusChange(order?.id, pendingStatus);
		pendingStatus = null;
		confirmingChange = false;
		open = false;
	}

	function handleCancelConfirm() {
		selectedStatus = order?.status ?? 'pending';
		pendingStatus = null;
		confirmingChange = false;
	}

	function getOrderStatusVariant(
		status: string
	): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status?.toLowerCase()) {
			case 'completed':
				return 'default';
			case 'processing':
				return 'secondary';
			case 'pending':
				return 'outline';
			case 'cancelled':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function getPaymentStatusVariant(
		status: string
	): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status?.toLowerCase()) {
			case 'paid':
				return 'default';
			case 'unpaid':
				return 'secondary';
			case 'failed':
				return 'destructive';
			case 'cancelled':
				return 'destructive';
			case 'expired':
				return 'outline';
			default:
				return 'outline';
		}
	}

	let isDesktop = new MediaQuery('(min-width: 768px)');
</script>

{#snippet orderContent()}
	{#if isLoading}
		<!-- Skeleton loading state -->
		<div class="flex animate-pulse flex-col gap-0">
			<!-- Header skeleton -->
			<div class="flex items-start justify-between gap-3 px-6 pt-5 pb-4">
				<div class="flex flex-col gap-2">
					<Skeleton class="h-3 w-10" />
					<Skeleton class="h-5 w-52" />
					<Skeleton class="h-3 w-16" />
				</div>
				<Skeleton class="h-7 w-7 rounded-md" />
			</div>
			<div class="flex items-center gap-2 px-6 pb-4">
				<Skeleton class="h-5 w-24 rounded-full" />
				<Skeleton class="h-5 w-20 rounded-md" />
			</div>

			<Separator />

			<div class="flex flex-col gap-5 px-6 py-5">
				<div class="flex flex-col gap-2">
					<Skeleton class="h-3 w-10" />
					<div class="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
						<Skeleton class="h-9 w-9 shrink-0 rounded-full" />
						<div class="flex w-full flex-col gap-1.5">
							<Skeleton class="h-4 w-28" />
							<Skeleton class="h-3 w-44" />
						</div>
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<Skeleton class="h-3 w-12" />
					<div class="divide-y divide-border rounded-lg border border-border">
						{#each [1, 2, 3] as _}
							<div class="flex items-center justify-between px-4 py-2.5">
								<Skeleton class="h-3 w-16" />
								<Skeleton class="h-3 w-24" />
							</div>
						{/each}
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<Skeleton class="h-3 w-14" />
					<div class="divide-y divide-border rounded-lg border border-border">
						{#each [1, 2, 3] as _}
							<div class="flex items-center justify-between px-4 py-2.5">
								<Skeleton class="h-3 w-16" />
								<Skeleton class="h-3 w-20" />
							</div>
						{/each}
					</div>
				</div>
			</div>

			<Separator />

			<div class="flex items-center gap-2 px-6 py-4">
				<Skeleton class="h-3 w-12" />
				<Skeleton class="h-8 flex-1 rounded-md" />
				<Skeleton class="h-8 w-14 rounded-md" />
			</div>
		</div>
	{:else if order}
		<!-- Actual content -->
		<div class="flex flex-col gap-0">
			<!-- Header: title + close button -->
			<div class="flex items-start justify-between gap-3 px-6 pt-5 pb-3">
				<div class="flex flex-col gap-0.5">
					<p class="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
						Order
					</p>
					<h2 class="text-base leading-snug font-semibold text-foreground">
						{order.product?.name ?? 'Unknown Product'}
					</h2>
					<p class="font-mono text-[11px] text-muted-foreground">
						#{order.id.split('-')[0].toUpperCase()}
					</p>
				</div>
			</div>

			<!-- Status badge + amount chip in header, no duplication in footer -->
			<div class="flex items-center gap-2 px-6 pb-4">
				<Badge
					variant={getOrderStatusVariant(order.status)}
					class="px-2.5 py-1 text-[11px] capitalize"
				>
					{order.status}
				</Badge>
				<span
					class="rounded-md border border-border bg-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-foreground"
				>
					{formatPrice(order.ordered_price)}
				</span>
			</div>

			<Separator />

			<ScrollArea class="max-h-[58vh] min-h-0 overflow-y-auto">
				<div class="flex flex-col gap-5 px-6 py-5">
					<!-- Client -->
					<div class="flex flex-col gap-2">
						<p class="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
							Client
						</p>
						{#if order.user}
							<div class="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
								<Avatar.Root class="h-9 w-9 shrink-0 border border-border">
									<Avatar.Image
										src={order.user.profile_picture}
										alt={order.user.full_name}
										referrerpolicy="no-referrer"
									/>
									<Avatar.Fallback class="bg-muted text-xs font-medium text-muted-foreground">
										{initials(order.user.full_name)}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="flex min-w-0 flex-col gap-0.5">
									<span class="truncate text-sm font-medium text-foreground">
										{order.user.full_name}
									</span>
									<span class="truncate text-xs text-muted-foreground">
										{order.user.email}
									</span>
									{#if order.user.phone_number}
										<span class="truncate text-xs text-muted-foreground">
											{order.user.phone_number}
										</span>
									{/if}
								</div>
								{#if order.user.global_role}
									<Badge variant="outline" class="ml-auto shrink-0 text-[10px] capitalize">
										{order.user.global_role.toLowerCase()}
									</Badge>
								{/if}
							</div>
						{:else}
							<p class="text-sm text-muted-foreground italic">No client information.</p>
						{/if}
					</div>

					<!-- Order details -->
					<div class="flex flex-col gap-2">
						<p class="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
							Details
						</p>
						<div class="divide-y divide-border rounded-lg border border-border">
							<div class="flex items-center justify-between px-4 py-2.5">
								<span class="text-xs text-muted-foreground">Amount</span>
								<span class="font-mono text-sm font-semibold text-foreground">
									{formatPrice(order.ordered_price)}
								</span>
							</div>
							<div class="flex items-center justify-between px-4 py-2.5">
								<span class="text-xs text-muted-foreground">Created</span>
								<span class="text-xs text-foreground">{formatDate(order.created_at)}</span>
							</div>
							<div class="flex items-center justify-between px-4 py-2.5">
								<span class="text-xs text-muted-foreground">Last updated</span>
								<span class="text-xs text-foreground">{formatDate(order.updated_at)}</span>
							</div>
							{#if order.product?.slug}
								<div class="flex items-center justify-between px-4 py-2.5">
									<span class="text-xs text-muted-foreground">Product slug</span>
									<span class="font-mono text-[11px] text-muted-foreground"
										>{order.product.slug}</span
									>
								</div>
							{/if}
						</div>
					</div>

					<!-- Payments -->
					<div class="flex flex-col gap-2">
						<p class="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
							Payment
						</p>
						{#if order.payment && order.payment.length > 0}
							<div class="flex flex-col gap-2">
								{#each order.payment as p (p.payment_id)}
									<div class="divide-y divide-border rounded-lg border border-border">
										<div class="flex items-center justify-between px-4 py-2.5">
											<span class="text-xs text-muted-foreground">Status</span>
											<Badge
												variant={getPaymentStatusVariant(p.status)}
												class="text-[10px] capitalize"
											>
												{p.status}
											</Badge>
										</div>
										<div class="flex items-center justify-between px-4 py-2.5">
											<span class="text-xs text-muted-foreground">Method</span>
											<span class="text-xs font-medium text-foreground uppercase"
												>{p.method ?? '—'}</span
											>
										</div>
										<div class="flex items-center justify-between px-4 py-2.5">
											<span class="text-xs text-muted-foreground">Amount</span>
											<span class="font-mono text-sm text-foreground">{formatPrice(p.amount)}</span>
										</div>
										{#if p.fee}
											<div class="flex items-center justify-between px-4 py-2.5">
												<span class="text-xs text-muted-foreground">Fee</span>
												<span class="font-mono text-sm text-muted-foreground"
													>{formatPrice(p.fee)}</span
												>
											</div>
										{/if}
										{#if p.total_payment}
											<div class="flex items-center justify-between px-4 py-2.5">
												<span class="text-xs text-muted-foreground">Total charged</span>
												<span class="font-mono text-sm font-semibold text-foreground"
													>{formatPrice(p.total_payment)}</span
												>
											</div>
										{/if}
										{#if p.paid_at}
											<div class="flex items-center justify-between px-4 py-2.5">
												<span class="text-xs text-muted-foreground">Paid at</span>
												<span class="text-xs text-foreground">{formatDate(p.paid_at)}</span>
											</div>
										{/if}
										{#if p.expired_at}
											<div class="flex items-center justify-between px-4 py-2.5">
												<span class="text-xs text-muted-foreground">Expires at</span>
												<span class="text-xs text-muted-foreground">{formatDate(p.expired_at)}</span
												>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<div class="rounded-lg border border-border px-4 py-4">
								<p class="text-sm text-muted-foreground italic">No payment records.</p>
							</div>
						{/if}
					</div>
				</div>
			</ScrollArea>

			<Separator />

			{#if showChangeButton}
				<div class="bg-muted/10 px-6 py-3">
					{#if !confirmingChange}
						<!-- Normal state: select + Save (disabled until value changes) -->
						<div class="flex items-center gap-2">
							<span class="shrink-0 text-xs text-muted-foreground">Status</span>
							<Select.Root
								value={selectedStatus}
								onValueChange={handleSelectChange}
								type="single"
								disabled={statusUpdating}
							>
								<Select.Trigger class="h-8 flex-1 text-xs capitalize">
									{selectedStatus}
								</Select.Trigger>
								<Select.Content>
									{#each ORDER_STATUSES as s}
										<Select.Item value={s} class="py-2 text-xs capitalize">
											<div class="flex items-center gap-2">
												{#if s === selectedStatus}
													<span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
												{:else}
													<span class="h-1.5 w-1.5 rounded-full bg-transparent"></span>
												{/if}
												{s}
											</div>
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<Button
								size="sm"
								class="h-8 px-4 text-xs"
								disabled={!pendingStatus || statusUpdating}
								onclick={handleSave}
							>
								{statusUpdating ? 'Saving…' : 'Save'}
							</Button>
						</div>
					{:else}
						<!-- Confirm step: prevents accidental status changes -->
						<div class="flex items-center gap-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="shrink-0 text-destructive"
								><path
									d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
								/><path d="M12 9v4" /><path d="M12 17h.01" /></svg
							>
							<p class="flex-1 text-xs text-muted-foreground">
								Change to <span class="font-medium text-foreground capitalize">{pendingStatus}</span
								>?
							</p>
							<Button
								variant="ghost"
								size="sm"
								class="h-8 px-3 text-xs text-muted-foreground"
								onclick={handleCancelConfirm}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								size="sm"
								class="h-8 px-3 text-xs"
								onclick={handleConfirm}
							>
								Confirm
							</Button>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

<!-- Desktop: Dialog -->
{#if isDesktop.current}
	<Dialog.Root bind:open>
		<Dialog.Content class="max-w-lg gap-0 overflow-hidden p-0">
			{@render orderContent()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<!-- Mobile: Drawer -->
	<Drawer.Root bind:open>
		<Drawer.Content class="gap-0 p-0">
			{@render orderContent()}
		</Drawer.Content>
	</Drawer.Root>
{/if}
