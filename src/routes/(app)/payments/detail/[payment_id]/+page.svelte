<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import {
		RiArrowLeftLine,
		RiCheckLine,
		RiFileCopyLine,
		RiRefreshLine,
		RiCloseCircleLine,
		RiTimerLine
	} from 'remixicon-svelte';

	let { data } = $props();

	let isSyncing = $state(false);
	let isCanceling = $state(false);
	let copied = $state(false);
	let showCancelModal = $state(false);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => copied = false, 2000);
	};

	const handleSync = async () => {
		const paymentId = $page.params.payment_id;
		isSyncing = true;
		try {
			const res = await fetch(`/api/payment/sync/${paymentId}`, {
				method: 'POST'
			});
			const result = await res.json();
			if (res.ok) {
				location.reload(); // Quick way to refresh data
			} else {
				toast.error(result.error || result.message || 'Failed to sync payment.');
			}
		} catch (e) {
			toast.error('Network error while syncing.');
		} finally {
			isSyncing = false;
		}
	};

	const handleCancel = () => {
		showCancelModal = true;
	};

	const confirmCancel = async () => {
		const paymentId = $page.params.payment_id;
		isCanceling = true;
		try {
			const res = await fetch(`/api/payment/cancel/${paymentId}`, {
				method: 'POST'
			});
			const result = await res.json();
			if (res.ok) {
				location.reload();
			} else {
				toast.error(result.error || result.message || 'Failed to cancel payment.');
			}
		} catch (e) {
			toast.error('Network error while canceling.');
		} finally {
			isCanceling = false;
			showCancelModal = false;
		}
	};

	let timeLeft = $state(0);
	let timer: any;

	$effect(() => {
		data.paymentPromise.then(paymentData => {
			if (paymentData && paymentData.payment && paymentData.payment.status?.toLowerCase() === 'unpaid') {
				const expiredTime = new Date(paymentData.payment.expired_at).getTime();
				if (timer) clearInterval(timer);
				
				const updateTimer = () => {
					const now = Date.now();
					const diff = Math.floor((expiredTime - now) / 1000);
					if (diff > 0) {
						timeLeft = diff;
					} else {
						timeLeft = 0;
						clearInterval(timer);
					}
				};
				
				updateTimer();
				timer = setInterval(updateTimer, 1000);
			}
		});

		return () => {
			if (timer) clearInterval(timer);
		};
	});

	const formatTime = (secs: number) => {
		const m = Math.floor(secs / 60).toString().padStart(2, '0');
		const s = (secs % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	};
</script>

<div class="h-full w-full overflow-y-auto bg-background pb-12">
	<header class="h-[52px] px-6 flex items-center justify-between bg-background/85 backdrop-blur-md border-b sticky top-0 z-20 shrink-0">
		<div class="flex items-center gap-4">
			<button class="relative w-9 h-9 rounded-lg bg-transparent border-none cursor-pointer text-muted-foreground flex items-center justify-center transition-all hover:bg-secondary hover:text-foreground" onclick={() => goto('/products')}>
				<RiArrowLeftLine class="h-5 w-5" />
			</button>
			<span class="text-sm font-medium text-muted-foreground tracking-tight">Payment Detail</span>
		</div>
	</header>

	{#await data.paymentPromise}
		<div class="flex-1 p-8 text-center text-muted-foreground animate-pulse">Loading payment details...</div>
	{:then paymentData}
		{#if paymentData.error || !paymentData.payment}
			<div class="p-8 text-center text-destructive bg-destructive/10 m-6 rounded-2xl border border-destructive/20">
				{paymentData.error || 'Payment not found.'}
			</div>
		{:else}
			{@const payment = paymentData.payment}
			{@const isQris = payment.method === 'qris' || payment.method?.toLowerCase().includes('qris')}
			{@const isPending = payment.status?.toLowerCase() === 'unpaid'}
			{@const isSuccess = payment.status?.toLowerCase() === 'paid'}
			{@const isFailed = ['cancelled', 'expired', 'failed'].includes(payment.status?.toLowerCase())}

			{#if isSuccess || isFailed}
				<!-- Full Page Modal for Final States -->
				<div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
					<div class="bg-card w-full max-w-sm rounded-3xl shadow-2xl border p-8 text-center flex flex-col items-center">
						{#if isSuccess}
							<div class="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm" style="background: oklch(0.70 0.15 162 / 0.15); color: var(--chart-4);">
								<RiCheckLine class="h-10 w-10" />
							</div>
							<h2 class="text-2xl font-bold tracking-tight text-foreground mb-2">Payment Successful</h2>
							<p class="text-sm text-muted-foreground mb-8">Thank you for your order! Your payment has been verified.</p>
							<button class="w-full py-3.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors text-[15px]" onclick={() => goto('/products')}>
								Back to Products
							</button>
						{:else}
							<div class="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 shadow-sm">
								<RiCloseCircleLine class="h-10 w-10" />
							</div>
							<h2 class="text-2xl font-bold tracking-tight text-foreground capitalize mb-2">Payment {payment.status}</h2>
							<p class="text-sm text-muted-foreground mb-8">This transaction is no longer valid or has been cancelled.</p>
							<button class="w-full py-3.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors text-[15px]" onclick={() => goto('/products')}>
								Back to Products
							</button>
						{/if}
					</div>
				</div>
			{:else}
				<div class="max-w-md mx-auto p-4 sm:p-8">
					<div class="bg-card rounded-3xl p-6 border shadow-xl relative overflow-hidden">
						<div class="text-center mb-6">
						<h1 class="text-xl font-bold tracking-tight mb-1">Total Payment</h1>
						<div class="text-3xl font-bold text-primary">{formatPrice(payment.amount || payment.gross_amount)}</div>
						<p class="text-xs text-muted-foreground mt-2">Order ID: {payment.order_id}</p>
					</div>

					<div class="border-t border-b py-6 mb-6 flex flex-col items-center">
						<span class="text-sm font-medium mb-4 uppercase tracking-wider text-muted-foreground">
							{payment.method?.replace(/_/g, ' ')}
						</span>

						{#if isQris}
							<!-- QR Code Rendering -->
							<div class="w-full text-left mb-4">
								<div class="text-[13px] font-semibold mb-1">Scan to pay</div>
								<div class="text-xs text-muted-foreground mb-4">Works with GoPay, OVO, BCA, Mandiri, and all QRIS-enabled apps</div>
								<div class="flex justify-center">
									<div class="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 relative">
										<img 
											src={`https://api.qrserver.com/v1/create-qr-code/?size=208x208&data=${encodeURIComponent(payment.payment_number)}`} 
											alt="QR Code" 
											class="w-52 h-52 object-contain"
										/>
									</div>
								</div>
								<div class="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
									Open your banking or e-wallet app, tap <strong>Pay / QRIS</strong>, then scan this code.
								</div>
							</div>
						{:else}
							<!-- VA Number Rendering -->
							{@const displayNo = payment.payment_number}
							
							<div class="w-full text-left mb-2">
								<div class="text-[13px] font-semibold mb-3">Transfer to this account</div>
								<div class="flex flex-col gap-2">
									<div class="flex items-center justify-between p-3.5 border rounded-xl bg-card transition-colors hover:border-primary/30">
										<div class="font-semibold text-sm w-[80px] text-primary uppercase break-words leading-tight">
											{payment.method?.replace(/_va/g, '').replace(/_/g, ' ')}
										</div>
										<div class="flex-1 px-4 border-l ml-4 border-border">
											<div class="font-mono text-base font-bold tracking-wider">{displayNo}</div>
											<div class="text-[11px] text-muted-foreground mt-0.5">a/n SPRDlab Creative Indonesia</div>
										</div>
										<button class="w-8 h-8 rounded-lg border-none flex items-center justify-center cursor-pointer transition-all {copied ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'}" onclick={() => copyToClipboard(displayNo?.replace(/\\s/g, ''))}>
											{#if copied}
												<RiCheckLine class="h-4 w-4" />
											{:else}
												<RiFileCopyLine class="h-4 w-4" />
											{/if}
										</button>
									</div>
								</div>
							</div>
							
							<div class="text-xs text-muted-foreground mt-3 p-3 bg-secondary/50 rounded-lg leading-relaxed flex items-start text-left">
								<RiCheckLine class="h-4 w-4 mr-1.5 shrink-0 mt-0.5" />
								<span>After transferring, your payment will be verified automatically.</span>
							</div>
						{/if}
					</div>

					{#if isPending}
						<div class="flex items-center justify-center gap-2 text-destructive font-mono font-bold text-lg mb-6">
							<RiTimerLine class="h-5 w-5" /> {formatTime(timeLeft)}
						</div>
					{/if}

					<div class="flex flex-col gap-3">
						<button 
							class="w-full py-3.5 flex items-center justify-center font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-50 text-[15px]"
							onclick={handleSync}
							disabled={isSyncing || !isPending}
						>
							<RiRefreshLine class="h-5 w-5 mr-2 {isSyncing ? 'animate-spin' : ''}" />
							{isSyncing ? 'Checking...' : 'Check Payment Status'}
						</button>
						
						<button 
							class="w-full py-3.5 flex items-center justify-center font-bold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm transition-colors disabled:opacity-50 text-[15px]"
							onclick={handleCancel}
							disabled={isCanceling || !isPending}
						>
							Cancel Payment
						</button>
					</div>
					</div>
				</div>
			{/if}
		{/if}
	{:catch error}
		<div class="p-8 text-center text-destructive">
			Failed to load payment details.
		</div>
	{/await}

	{#if showCancelModal}
		<div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
			<div class="bg-card w-full max-w-sm rounded-3xl shadow-2xl border overflow-y-auto max-h-[90vh]" onclick={e => e.stopPropagation()}>
				<div class="p-6 text-center">
					<div class="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4 text-destructive shadow-sm">
						<RiCloseCircleLine class="h-8 w-8" />
					</div>
					<h3 class="text-xl font-bold tracking-tight mb-2">Cancel Payment</h3>
					<p class="text-sm text-muted-foreground mb-6 leading-relaxed">
						Are you sure you want to cancel this payment? This action cannot be undone.
					</p>
					<div class="flex flex-col gap-2">
						<button class="sprd-btn bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full h-10 text-sm border-none flex items-center justify-center gap-2 shadow-sm transition-all" onclick={confirmCancel} disabled={isCanceling}>
							{#if isCanceling}
								<RiRefreshLine class="h-4 w-4 animate-spin" />
							{/if}
							Yes, Cancel Payment
						</button>
						<button class="sprd-btn sprd-btn--ghost w-full h-10 text-sm text-muted-foreground hover:bg-secondary/10" onclick={() => showCancelModal = false} disabled={isCanceling}>
							No, keep it
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
