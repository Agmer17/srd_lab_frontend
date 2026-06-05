<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let methodGroup = $state('qris');
	let selectedMethod = $state('qris');
	let isProcessing = $state(false);

	const bankMethods = [
		{ id: 'bni_va', name: 'BNI', fullname: 'BNI Virtual Account' },
		{ id: 'bri_va', name: 'BRI', fullname: 'BRI Virtual Account' },
		{ id: 'cimb_niaga_va', name: 'CIMB Niaga', fullname: 'CIMB Niaga VA' },
		{ id: 'sampoerna_va', name: 'Sampoerna', fullname: 'Sampoerna VA' },
		{ id: 'bnc_va', name: 'BNC', fullname: 'Bank Neo Commerce VA' },
		{ id: 'maybank_va', name: 'Maybank', fullname: 'Maybank VA' },
		{ id: 'permata_va', name: 'Permata', fullname: 'Permata VA' },
		{ id: 'atm_bersama_va', name: 'ATM Bersama', fullname: 'ATM Bersama VA' },
		{ id: 'artha_graha_va', name: 'Artha Graha', fullname: 'Artha Graha VA' }
	];

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	};

	const handleGroupSelect = (id: string) => {
		methodGroup = id;
		if (id === 'qris') {
			selectedMethod = 'qris';
		} else {
			selectedMethod = ''; // Reset until they pick a bank
		}
	};

	const handlePayment = async () => {
		if (!selectedMethod) {
			toast.error('Please select a specific payment method.');
			return;
		}

		const orderId = $page.params.order_id;
		isProcessing = true;

		try {
			const res = await fetch(`/api/payment/create/${orderId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ method: selectedMethod })
			});
			const result = await res.json();

			if (res.ok && result.data?.payment_id) {
				goto(`/payments/detail/${result.data.payment_id}`);
			} else {
				toast.error(result.error || result.message || 'Failed to initialize payment.');
			}
		} catch (error) {
			toast.error('Network error while processing payment.');
		} finally {
			isProcessing = false;
		}
	};
</script>

<div>
	<header
		class="sticky top-0 z-20 flex h-[52px] shrink-0 items-center justify-between border-b bg-background/85 px-6 backdrop-blur-md"
	>
		<button
			class="relative mr-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[17px] text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
			onclick={() => history.back()}
		>
			<i class="ri-arrow-left-line"></i>
		</button>
		<span class="text-sm font-medium tracking-tight text-muted-foreground">Complete payment</span>
	</header>

	{#await data.orderPromise}
		<div
			class="mx-auto flex max-w-5xl animate-pulse items-center justify-center p-8 pt-8 pb-20 text-muted-foreground"
		>
			Loading order details...
		</div>
	{:then orderData}
		{#if orderData.error || !orderData.order}
			<div
				class="mx-auto flex max-w-5xl items-center justify-center p-8 pt-8 pb-20 text-destructive"
			>
				{orderData.error || 'Order not found.'}
			</div>
		{:else}
			{@const order = orderData.order}
			{@const fee = Math.round(order.ordered_price * 0.01)}
			{@const total = order.ordered_price + fee}

			<div class="mx-auto max-w-5xl px-7 pt-8 pb-20">
				<div class="grid grid-cols-1 items-start gap-6 md:grid-cols-[1.4fr_1fr]">
					<div class="flex flex-col">
						<div class="mb-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
							Choose payment method
						</div>

						<div class="mb-5 flex flex-col gap-2">
							<button
								class="flex cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 text-left shadow-sm transition-all {methodGroup ===
								'qris'
									? 'border-primary bg-card ring-1 ring-primary'
									: 'border-border bg-card'}"
								onclick={() => handleGroupSelect('qris')}
							>
								<i
									class="ri-qr-code-line shrink-0 text-[22px] {methodGroup === 'qris'
										? 'text-primary'
										: 'text-muted-foreground'}"
								></i>
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
										QRIS
										<span
											class="rounded-full bg-primary px-2 py-[2px] text-[9px] font-bold tracking-wider text-primary-foreground uppercase"
											>Recommended</span
										>
									</div>
									<div class="mt-0.5 text-[11.5px] text-muted-foreground">
										Scan with any banking / e-wallet app
									</div>
								</div>
								<div
									class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all {methodGroup ===
									'qris'
										? 'border-primary bg-primary text-[11px] text-primary-foreground'
										: 'border-border'}"
								>
									{#if methodGroup === 'qris'}
										<i class="ri-check-line"></i>
									{/if}
								</div>
							</button>

							<button
								class="flex cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 text-left shadow-sm transition-all {methodGroup ===
								'bank_transfer'
									? 'border-primary bg-card ring-1 ring-primary'
									: 'border-border bg-card'}"
								onclick={() => handleGroupSelect('bank_transfer')}
							>
								<i
									class="ri-bank-line shrink-0 text-[22px] {methodGroup === 'bank_transfer'
										? 'text-primary'
										: 'text-muted-foreground'}"
								></i>
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
										Virtual Account (VA)
									</div>
									<div class="mt-0.5 text-[11.5px] text-muted-foreground">
										Automatic verification via Bank Transfer
									</div>
								</div>
								<div
									class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all {methodGroup ===
									'bank_transfer'
										? 'border-primary bg-primary text-[11px] text-primary-foreground'
										: 'border-border'}"
								>
									{#if methodGroup === 'bank_transfer'}
										<i class="ri-check-line"></i>
									{/if}
								</div>
							</button>
						</div>

						{#if methodGroup === 'bank_transfer'}
							<div
								class="mb-5 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
							>
								<div class="text-[13px] font-semibold text-foreground">Select your bank</div>
								<div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
									{#each bankMethods as b}
										<button
											class="cursor-pointer rounded-lg border bg-transparent p-3.5 text-center transition-all hover:border-primary/50 {selectedMethod ===
											b.id
												? 'border-primary ring-1 ring-primary'
												: 'border-border'}"
											onclick={() => (selectedMethod = b.id)}
										>
											<div
												class="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-base font-extrabold shadow-sm transition-colors {selectedMethod ===
												b.id
													? 'border-transparent bg-primary text-primary-foreground'
													: 'border border-slate-200 bg-white text-slate-900'}"
											>
												{b.name.charAt(0)}
											</div>
											<div class="mt-1.5 text-xs font-semibold text-foreground">{b.name}</div>
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<div class="mt-6">
							<button
								class="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[6.5px] border border-transparent bg-primary px-4 text-[15px] font-medium tracking-tight whitespace-nowrap text-primary-foreground transition-all hover:bg-primary/90 active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50"
								onclick={handlePayment}
								disabled={isProcessing}
							>
								{#if isProcessing}
									<i class="ri-loader-4-line mr-2 animate-spin"></i> Processing...
								{:else}
									Process Payment <i class="ri-arrow-right-line ml-2"></i>
								{/if}
							</button>
						</div>
					</div>

					<div class="sticky top-[68px] rounded-xl border border-border bg-card p-5 shadow-sm">
						<div class="mb-4 text-sm font-semibold text-foreground">Order summary</div>

						<div class="mb-4 flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
							<div
								class="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg bg-primary text-xl text-primary-foreground"
							>
								<i class="ri-box-3-line"></i>
							</div>
							<div>
								<div class="text-[14px] font-semibold text-foreground">
									{order.product?.name || 'Service Package'}
								</div>
								<div class="mt-[3px] font-mono text-[11px] text-muted-foreground">
									{order.id?.substring(0, 8).toUpperCase() || order.id}
								</div>
							</div>
						</div>

						<div class="mb-3 flex flex-col gap-2 border-b border-dashed border-border pb-3">
							<div class="flex justify-between text-[13px] text-muted-foreground">
								<span>Service price</span>
								<span class="font-mono font-medium text-foreground"
									>{formatPrice(order.ordered_price)}</span
								>
							</div>
							<div class="flex justify-between text-[13px] text-muted-foreground">
								<span>Processing fee (1%)</span>
								<span class="font-mono font-medium text-foreground">{formatPrice(fee)}</span>
							</div>
						</div>

						<div class="flex items-baseline justify-between">
							<span class="text-[14px] font-semibold text-foreground">Total</span>
							<span class="font-mono text-[22px] font-bold tracking-tight text-foreground"
								>{formatPrice(total)}</span
							>
						</div>

						<div
							class="mt-4 flex items-start gap-2 border-t border-border pt-3.5 text-[11.5px] leading-relaxed text-muted-foreground"
						>
							<i class="ri-shield-check-line shrink-0 text-primary"></i>
							Payments are secured and processed automatically.
						</div>
					</div>
				</div>
			</div>
		{/if}
	{:catch error}
		<div class="mx-auto flex max-w-5xl items-center justify-center p-8 pt-8 pb-20 text-destructive">
			Failed to load checkout details.
		</div>
	{/await}
</div>
