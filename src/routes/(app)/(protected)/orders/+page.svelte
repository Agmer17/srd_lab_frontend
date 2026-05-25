<script lang="ts">
	import OrderList from '$lib/components/orders/OrderList.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { currentUserStore } from '$lib/state/currentUser.svelte';

	// Menerima data dari page.ts via Svelte 5 Runes.
	// Tipe datanya aku biarin 'any' biar nanti gampang kamu sesuaikan sendiri DTO-nya.
	let { data } = $props();
	// Destructuring data dari load function page.ts
	// Asumsi di page.ts kamu nge-return object yang isinya:
	// { myOrders: [], allOrders: [], isAdmin: boolean }
	let { myOrders, allOrders } = $derived(data);

	const isAdmin = $derived(currentUserStore.data?.global_role == 'ADMIN');
	console.log('KENAPA INI ADMIN :  ', isAdmin);
</script>

<div class="min-h-0 w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
	<div class="mx-auto w-full max-w-6xl space-y-6">
		<div class="flex flex-col gap-1">
			{#if !isAdmin}
				<h1 class="font-sans text-2xl font-semibold tracking-tight text-foreground">
					Orders Management
				</h1>
				<p class="text-sm text-muted-foreground">View and manage your recent transactions.</p>
			{:else}
				<h1 class="font-sans text-2xl font-semibold tracking-tight text-foreground">
					Admin Orders Management
				</h1>
				<p class="text-sm text-muted-foreground">View and manage all of the orders</p>
			{/if}
		</div>
		<Tabs.Root value="my-orders" class="w-full">
			{#if isAdmin}
				<div class="flex items-center justify-between pb-4">
					<Tabs.List class="inline-flex w-auto max-w-[400px] bg-muted/40">
						<Tabs.Trigger
							value="my-orders"
							class="text-sm tracking-tight data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
						>
							My Orders
						</Tabs.Trigger>

						{#if isAdmin}
							<Tabs.Trigger
								value="all-orders"
								class="text-sm tracking-tight data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
							>
								All Orders
							</Tabs.Trigger>
						{/if}
					</Tabs.List>
				</div>
			{/if}

			<Tabs.Content value="my-orders" class="m-0 focus-visible:ring-0 focus-visible:outline-none">
				<OrderList orders={myOrders} {isAdmin} />
			</Tabs.Content>

			{#if isAdmin}
				<Tabs.Content
					value="all-orders"
					class="m-0 focus-visible:ring-0 focus-visible:outline-none"
				>
					<OrderList orders={allOrders} {isAdmin} />
				</Tabs.Content>
			{/if}
		</Tabs.Root>
	</div>
</div>
