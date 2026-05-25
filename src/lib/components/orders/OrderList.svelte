<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { Order, OrderListDTO } from '$lib/types/order';
	import { formatDate, parseError } from '$lib/api_utils';
	import { formatPrice } from '$lib/string_utils';
	import OrderDetails from './OrderDetails.svelte';
	import type { ApiResponse } from '$lib/types/api';
	import { Toaster } from 'svelte-sonner';
	import { themeData } from '$lib/state/theme.svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { orders = [], isAdmin }: { orders: OrderListDTO[]; isAdmin: boolean } = $props();

	let searchQuery = $state('');

	let filteredOrders = $derived(
		orders.filter((order) => {
			const matchesProduct = order.product?.name?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesUser =
				order.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesProduct || matchesUser;
		})
	);

	const statusConfig = {
		paid: 'bg-chart-4 text-white hover:bg-chart-4/80 border-transparent',
		unpaid: 'bg-muted text-muted-foreground border-transparent',
		failed: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
		expired: 'bg-orange-500/10 text-orange-600 border-orange-200',
		cancelled: 'bg-destructive text-destructive-foreground hover:bg-destructive/80' // Sesuai permintaan
	};

	let openDetails = $state(false);
	let selectedOrders = $state<Order | null>(null);
	let isDetailsLoading = $state(false);

	async function changeOrderStatus(id: string | undefined, newStatus: string) {
		if (!id) return;
		// console.log(newStatus);
		const updatePromise = fetch('/api/orders/update/' + id + '/status', {
			method: 'PATCH',
			body: JSON.stringify({ status: newStatus })
		}).then(async (res) => {
			const apiResponse: ApiResponse<Order> = await res.json();
			if (!apiResponse.success) {
				throw new Error(parseError(apiResponse.error));
			}

			await invalidateAll();
			return apiResponse;
		});

		toast.promise(updatePromise, {
			loading: 'trying to update the orders....',
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});
	}

	async function getOrderDetails(id: string) {
		openDetails = true;
		isDetailsLoading = true;
		try {
			const res = await fetch('/api/orders/details/' + id);
			const apiResponse: ApiResponse<Order> = await res.json();

			if (!apiResponse.success) {
				selectedOrders = null;
			} else {
				selectedOrders = apiResponse.data;
			}
		} catch (error) {
			selectedOrders = null;
		} finally {
			isDetailsLoading = false;
		}
	}
</script>

<div class="w-full space-y-4 p-1">
	<Toaster richColors theme={themeData.value} position="top-right" />

	<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<div class="w-full max-w-sm">
			<Input
				type="text"
				placeholder="Search products or clients..."
				bind:value={searchQuery}
				class="h-9 w-full border-border bg-card text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:ring-ring"
			/>
		</div>
		<div class="font-mono text-xs tracking-tight text-muted-foreground">
			Showing <span class="font-medium text-foreground">{filteredOrders.length}</span> orders
		</div>
	</div>

	<div class="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
		<Table.Root>
			<Table.Header>
				<Table.Row class="border-b border-border hover:bg-transparent">
					<Table.Head
						class="h-10 w-[200px] text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>Product</Table.Head
					>
					<Table.Head
						class="h-10 w-[240px] text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>Client</Table.Head
					>
					<Table.Head
						class="h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>Status</Table.Head
					>
					<Table.Head
						class="h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>Date</Table.Head
					>
					<Table.Head
						class="h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>Payment</Table.Head
					>
					<Table.Head
						class="h-10 pr-6 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>Amount</Table.Head
					>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if filteredOrders.length === 0}
					<Table.Row>
						<Table.Cell colspan={6} class="py-16 text-center text-sm text-muted-foreground">
							No matching orders found.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each filteredOrders as order (order.id)}
						<Table.Row
							onclick={() => getOrderDetails(order.id)}
							class="group border-b border-border transition-colors hover:cursor-pointer hover:bg-muted/10"
						>
							<Table.Cell class="py-3 align-middle">
								<div class="flex flex-col gap-1">
									<span
										class="text-sm font-medium tracking-tight text-foreground transition-colors group-hover:text-secondary"
									>
										{order.product?.name || 'Unknown Product'}
									</span>
									<span class="max-w-[150px] truncate font-mono text-[10px] text-muted-foreground">
										{order.id.split('-')[0]}</span
									>
								</div>
							</Table.Cell>

							<Table.Cell class="py-3 align-middle">
								{#if order.user}
									<div class="flex items-center gap-3">
										<Avatar.Root class="h-8 w-8 border border-border shadow-sm">
											<Avatar.Image
												src={order.user.profile_picture}
												alt={order.user.full_name}
												referrerpolicy="no-referrer"
											/>
											<Avatar.Fallback
												class="bg-secondary text-[11px] font-medium text-secondary-foreground"
											>
												{order.user.full_name?.substring(0, 2).toUpperCase() || 'US'}
											</Avatar.Fallback>
										</Avatar.Root>
										<div class="flex min-w-0 flex-col">
											<span class="truncate text-sm font-medium text-foreground">
												{order.user.full_name}
											</span>
											<span class="truncate text-[11px] text-muted-foreground">
												{order.user.email}
											</span>
										</div>
									</div>
								{:else}
									<span class="text-sm text-muted-foreground">-</span>
								{/if}
							</Table.Cell>

							<Table.Cell class="py-3 align-middle">
								{#if order.status.toLowerCase() === 'completed'}
									<Badge variant="default">Completed</Badge>
								{:else if order.status.toLowerCase() === 'pending'}
									<Badge variant="secondary">Pending</Badge>
								{:else if order.status.toLowerCase() === 'cancelled'}
									<Badge variant="destructive">Cancelled</Badge>
								{:else}
									<Badge variant="outline">
										{order.status}
									</Badge>
								{/if}
							</Table.Cell>

							<Table.Cell class="py-3 align-middle text-sm text-muted-foreground">
								{formatDate(order.created_at)}
							</Table.Cell>

							<Table.Cell class="py-3 align-middle">
								{#if order.payment && order.payment.length > 0}
									<div class="flex flex-col gap-1">
										{#each order.payment as p}
											<div class="flex items-center gap-2">
												<Badge
													variant="outline"
													class="px-2 py-0 text-[10px] font-bold tracking-wide capitalize {statusConfig[
														p.status
													] || 'bg-secondary'}"
												>
													{p.status}
												</Badge>

												{#if p.method}
													<span
														class="text-[10px] font-medium tracking-tighter text-muted-foreground uppercase"
													>
														{p.method}
													</span>
												{/if}
											</div>
										{:else}
											<span class="text-[10px] italic text-muted-foreground">No payment info</span>
										{/each}
									</div>
								{:else}
									<span class="text-xs text-muted-foreground italic">No payment info</span>
								{/if}
							</Table.Cell>

							<Table.Cell class="py-3 pr-6 text-right align-middle">
								<span class="font-mono text-sm font-semibold text-foreground">
									{formatPrice(order.ordered_price)}
								</span>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>

<OrderDetails
	bind:open={openDetails}
	isLoading={isDetailsLoading}
	order={selectedOrders}
	onStatusChange={changeOrderStatus}
	showChangeButton={isAdmin}
></OrderDetails>
