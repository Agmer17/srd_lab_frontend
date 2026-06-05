<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { Payment } from '$lib/types/payment';
	import { goto } from '$app/navigation';
	import { formatDate } from '$lib/api_utils';
	import { formatPrice } from '$lib/string_utils';
	import { RiCloseLine, RiCheckLine, RiCloseCircleLine } from 'remixicon-svelte';

	let { data } = $props();

	let searchQuery = $state('');
	let selectedPayment = $state<Payment | null>(null);

	// Real-time countdown — tick every second
	let now = $state(Date.now());
	$effect(() => {
		const t = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(t);
	});

	function secondsLeft(expiredAt: string | null): number {
		if (!expiredAt) return 0;
		const diff = Math.floor((new Date(expiredAt).getTime() - now) / 1000);
		return diff > 0 ? diff : 0;
	}

	function formatCountdown(secs: number): string {
		if (secs <= 0) return 'Expired';
		const h = Math.floor(secs / 3600);
		const m = Math.floor((secs % 3600) / 60);
		const s = secs % 60;
		if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	function getMethodLabel(method: string | null): string {
		if (!method) return '—';
		if (method.toLowerCase() === 'qris') return 'QRIS';
		return method.replace(/_va$/gi, '').replace(/_/g, ' ').toUpperCase() + ' VA';
	}

	function handleRowClick(payment: Payment) {
		if (data.isAdmin) {
			selectedPayment = payment;
		} else {
			const isCancelled = payment.status?.toLowerCase() === 'cancelled';
			if (!isCancelled) goto(`/payments/detail/${payment.payment_id}`);
		}
	}

	// Payment status → Badge variant + custom class (same pattern as OrderList)
	const statusConfig: Record<string, string> = {
		paid: 'bg-chart-4 text-white hover:bg-chart-4/80 border-transparent',
		unpaid: 'bg-muted text-muted-foreground border-transparent',
		failed: 'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent',
		expired: 'bg-orange-500/10 text-orange-600 border-orange-200',
		cancelled:
			'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent'
	};
</script>

<div class="min-h-0 w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
	<div class="mx-auto w-full max-w-6xl space-y-6">
		<!-- Header -->
		<div class="flex flex-col gap-1">
			<h1 class="font-sans text-2xl font-semibold tracking-tight text-foreground">
				{data.isAdmin ? 'All Payments (Admin)' : 'Payments'}
			</h1>
			<p class="text-sm text-muted-foreground">
				{data.isAdmin
					? 'View and manage all payment transactions across the system.'
					: 'View and manage your payment transactions.'}
			</p>
		</div>

		{#await data.historyPromise}
			<div class="flex items-center justify-center py-20 text-sm text-muted-foreground">
				<div class="flex flex-col items-center gap-3">
					<div
						class="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"
					></div>
					Loading payment history...
				</div>
			</div>
		{:then result}
			{#if result.error}
				<div
					class="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive"
				>
					{result.error}
				</div>
			{:else}
				{@const payments = result.payments as Payment[]}
				{@const filtered = payments.filter((p) => {
					const q = searchQuery.toLowerCase();
					return (
						p.payment_id?.toLowerCase().includes(q) ||
						p.method?.toLowerCase().includes(q) ||
						p.status?.toLowerCase().includes(q)
					);
				})}

				<!-- Search -->
				<div class="w-full max-w-sm">
					<Input
						type="text"
						placeholder="Search by method, status, ID..."
						bind:value={searchQuery}
						class="h-9 text-sm"
					/>
				</div>

				<div class="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
					<Table.Root>
						<Table.Header>
							<Table.Row class="border-b border-border hover:bg-transparent">
								<Table.Head
									class="pl-6 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
								>
									Payment ID
								</Table.Head>
								<Table.Head
									class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
								>
									Method
								</Table.Head>
								<Table.Head
									class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
								>
									Status
								</Table.Head>
								<Table.Head
									class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
								>
									Expires / Paid
								</Table.Head>
								<Table.Head
									class="pr-6 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase"
								>
									Amount
								</Table.Head>
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{#if filtered.length === 0}
								<Table.Row>
									<Table.Cell colspan={5} class="py-16 text-center text-sm text-muted-foreground">
										{payments.length === 0
											? data.isAdmin
												? 'No payment transactions found in the system.'
												: 'No payment transactions yet.'
											: 'No results match your search.'}
									</Table.Cell>
								</Table.Row>
							{:else}
								{#each filtered as payment (payment.payment_id)}
									{@const secs = secondsLeft(payment.expired_at)}
									{@const isUnpaid = payment.status?.toLowerCase() === 'unpaid'}
									{@const badgeClass =
										statusConfig[payment.status?.toLowerCase()] ??
										'bg-secondary text-secondary-foreground border-transparent'}
									{@const isCancelled = payment.status?.toLowerCase() === 'cancelled'}

									<Table.Row
										class="border-b border-border/60 transition-colors {!data.isAdmin && isCancelled
											? 'cursor-not-allowed bg-muted/20 opacity-60 hover:bg-muted/20'
											: 'cursor-pointer hover:bg-muted/40'}"
										onclick={() => handleRowClick(payment)}
									>
										<!-- Payment ID -->
										<Table.Cell class="py-3 pl-6 align-middle">
											<span class="font-mono text-xs font-semibold tracking-wide text-foreground">
												#{payment.payment_id.substring(0, 8).toUpperCase()}
											</span>
											<div class="mt-0.5 font-mono text-[10px] text-muted-foreground">
												{payment.order_id.substring(0, 8).toUpperCase()}
											</div>
										</Table.Cell>

										<!-- Method -->
										<Table.Cell class="py-3 align-middle">
											<span class="text-sm font-medium text-foreground">
												{getMethodLabel(payment.method)}
											</span>
										</Table.Cell>

										<!-- Status Badge -->
										<Table.Cell class="py-3 align-middle">
											<Badge
												variant="outline"
												class="px-2 py-0 text-[10px] font-bold tracking-wide uppercase {badgeClass}"
											>
												{payment.status}
											</Badge>
										</Table.Cell>

										<!-- Countdown / Paid date -->
										<Table.Cell class="py-3 align-middle text-sm text-muted-foreground">
											{#if isUnpaid && payment.expired_at}
												<span
													class="font-mono text-xs font-semibold {secs === 0
														? 'text-destructive'
														: 'text-orange-600'}"
												>
													{formatCountdown(secs)}
												</span>
											{:else if payment.paid_at}
												{formatDate(payment.paid_at)}
											{:else}
												<span class="text-xs italic">—</span>
											{/if}
										</Table.Cell>

										<!-- Amount -->
										<Table.Cell class="py-3 pr-6 text-right align-middle">
											<span class="font-mono text-sm font-semibold text-foreground">
												{formatPrice(payment.total_payment ?? payment.amount)}
											</span>
										</Table.Cell>
									</Table.Row>
								{/each}
							{/if}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		{:catch}
			<div
				class="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive"
			>
				Failed to load payment history.
			</div>
		{/await}
	</div>
</div>

<!-- Admin Detail Slide-Over Panel -->
{#if data.isAdmin && selectedPayment}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
		onclick={() => (selectedPayment = null)}
	></div>

	<!-- Panel -->
	<div
		class="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card shadow-2xl"
	>
		<!-- Panel Header -->
		<div
			class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4"
		>
			<div>
				<h2 class="text-base font-semibold text-foreground">Payment Detail</h2>
				<p class="mt-0.5 font-mono text-xs text-muted-foreground">
					#{selectedPayment.payment_id.substring(0, 8).toUpperCase()}
				</p>
			</div>
			<button
				onclick={() => (selectedPayment = null)}
				class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-colors hover:bg-secondary/80"
			>
				<RiCloseLine class="h-4 w-4 text-muted-foreground" />
			</button>
		</div>

		<!-- Status Banner -->
		<div class="flex flex-col items-center border-b border-border px-6 py-5">
			{#if selectedPayment.status?.toLowerCase() === 'paid'}
				<div
					class="mb-3 flex h-14 w-14 items-center justify-center rounded-full shadow-sm"
					style="background: oklch(0.70 0.15 162 / 0.15); color: var(--chart-4);"
				>
					<RiCheckLine class="h-7 w-7" />
				</div>
			{:else}
				<div
					class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-sm"
				>
					<RiCloseCircleLine class="h-7 w-7" />
				</div>
			{/if}
			<Badge
				variant="outline"
				class="px-3 py-1 text-xs font-bold tracking-wide uppercase {statusConfig[
					selectedPayment.status?.toLowerCase()
				] ?? 'border-transparent bg-secondary text-secondary-foreground'}"
			>
				{selectedPayment.status}
			</Badge>
		</div>

		<!-- Detail Fields -->
		<div class="flex flex-col gap-4 px-6 py-5">
			{#each [{ label: 'Payment ID', value: selectedPayment.payment_id }, { label: 'Order ID', value: selectedPayment.order_id }, { label: 'Method', value: getMethodLabel(selectedPayment.method) }, { label: 'Amount', value: formatPrice(selectedPayment.amount) }, { label: 'Fee', value: formatPrice(selectedPayment.fee ?? 0) }, { label: 'Total', value: selectedPayment.total_payment ? formatPrice(selectedPayment.total_payment) : '—' }, { label: 'Created', value: formatDate(selectedPayment.created_at) }, { label: 'Expires', value: selectedPayment.expired_at ? formatDate(selectedPayment.expired_at) : '—' }, { label: 'Paid At', value: selectedPayment.paid_at ? formatDate(selectedPayment.paid_at) : '—' }] as field}
				<div class="flex items-start justify-between gap-4">
					<span
						class="min-w-[80px] shrink-0 text-xs font-medium tracking-wider text-muted-foreground uppercase"
						>{field.label}</span
					>
					<span class="text-right font-mono text-sm break-all text-foreground">{field.value}</span>
				</div>
			{/each}

			{#if selectedPayment.payment_number}
				<div class="flex flex-col gap-1.5 border-t border-border pt-2">
					<span class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
						>Payment Number / QR Data</span
					>
					<div
						class="rounded-lg bg-secondary/40 p-3 font-mono text-xs leading-relaxed break-all text-foreground"
					>
						{selectedPayment.payment_number}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
