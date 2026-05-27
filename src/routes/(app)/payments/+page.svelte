<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { Payment } from '$lib/types/payment';
	import { goto } from '$app/navigation';
	import { formatDate } from '$lib/api_utils';
	import { formatPrice } from '$lib/string_utils';

	let { data } = $props();

	let searchQuery = $state('');

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

	// Payment status → Badge variant + custom class (same pattern as OrderList)
	const statusConfig: Record<string, string> = {
		paid:      'bg-chart-4 text-white hover:bg-chart-4/80 border-transparent',
		unpaid:    'bg-muted text-muted-foreground border-transparent',
		failed:    'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent',
		expired:   'bg-orange-500/10 text-orange-600 border-orange-200',
		cancelled: 'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent'
	};
</script>

<div class="min-h-0 w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
	<div class="mx-auto w-full max-w-6xl space-y-6">
		<!-- Header -->
		<div class="flex flex-col gap-1">
			<h1 class="font-sans text-2xl font-semibold tracking-tight text-foreground">
				Payments
			</h1>
			<p class="text-sm text-muted-foreground">View and manage your payment transactions.</p>
		</div>

		{#await data.historyPromise}
			<div class="flex items-center justify-center py-20 text-sm text-muted-foreground">
				<div class="flex flex-col items-center gap-3">
					<div class="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"></div>
					Loading payment history...
				</div>
			</div>

		{:then result}
			{#if result.error}
				<div class="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive">
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

				<div class="rounded-xl border border-border bg-card shadow-sm">
					<Table.Root>
						<Table.Header>
							<Table.Row class="border-b border-border hover:bg-transparent">
								<Table.Head class="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Payment ID
								</Table.Head>
								<Table.Head class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Method
								</Table.Head>
								<Table.Head class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Status
								</Table.Head>
								<Table.Head class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Expires / Paid
								</Table.Head>
								<Table.Head class="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Amount
								</Table.Head>
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{#if filtered.length === 0}
								<Table.Row>
									<Table.Cell colspan={5} class="py-16 text-center text-sm text-muted-foreground">
										{payments.length === 0 ? 'No payment transactions yet.' : 'No results match your search.'}
									</Table.Cell>
								</Table.Row>
							{:else}
								{#each filtered as payment (payment.payment_id)}
									{@const secs = secondsLeft(payment.expired_at)}
									{@const isUnpaid = payment.status?.toLowerCase() === 'unpaid'}
									{@const badgeClass = statusConfig[payment.status?.toLowerCase()] ?? 'bg-secondary text-secondary-foreground border-transparent'}

									<Table.Row
										class="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/40"
										onclick={() => goto(`/payments/detail/${payment.payment_id}`)}
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
												<span class="font-mono text-xs font-semibold {secs === 0 ? 'text-destructive' : 'text-orange-600'}">
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
			<div class="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive">
				Failed to load payment history.
			</div>
		{/await}
	</div>
</div>
