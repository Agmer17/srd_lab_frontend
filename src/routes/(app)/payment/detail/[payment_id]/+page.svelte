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
	import { onMount, onDestroy } from 'svelte';

	let { data } = $props();

	let isSyncing = $state(false);
	let isCanceling = $state(false);
	let copied = $state(false);

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

	const handleCancel = async () => {
		if (!confirm('Are you sure you want to cancel this payment?')) return;
		
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
		}
	};

	let timeLeft = $state(15 * 60); // 15 mins default
	let timer: any;

	onMount(() => {
		timer = setInterval(() => {
			if (timeLeft > 0) timeLeft--;
		}, 1000);
	});

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});

	const formatTime = (secs: number) => {
		const m = Math.floor(secs / 60).toString().padStart(2, '0');
		const s = (secs % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	};
</script>

<div class="min-h-screen bg-background">
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
			{@const isPending = payment.status === 'PENDING'}
			{@const isSuccess = payment.status === 'SETTLEMENT' || payment.status === 'SUCCESS'}
			{@const isFailed = payment.status === 'CANCEL' || payment.status === 'EXPIRE' || payment.status === 'DENY'}

			<div class="max-w-md mx-auto p-6 sm:p-8">
				<div class="bg-card rounded-3xl p-6 border shadow-xl relative overflow-hidden">
					{#if isSuccess}
						<div class="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
							<div class="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
								<RiCheckLine class="h-8 w-8" />
							</div>
							<h2 class="text-2xl font-bold tracking-tight text-foreground">Payment Successful</h2>
							<p class="text-sm text-muted-foreground mt-2">Thank you for your order!</p>
							<button class="sprd-btn sprd-btn--primary mt-6" onclick={() => goto('/products')}>Back to Products</button>
						</div>
					{/if}

					{#if isFailed}
						<div class="absolute inset-0 bg-destructive/5 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
							<div class="w-16 h-16 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center mb-4 shadow-lg shadow-destructive/30">
								<RiCloseCircleLine class="h-8 w-8" />
							</div>
							<h2 class="text-2xl font-bold tracking-tight text-foreground">Payment {payment.status}</h2>
							<p class="text-sm text-muted-foreground mt-2">This transaction is no longer valid.</p>
							<button class="sprd-btn sprd-btn--ghost mt-6 bg-background" onclick={() => goto('/products')}>Back to Products</button>
						</div>
					{/if}

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
											src={`https://api.qrserver.com/v1/create-qr-code/?size=208x208&data=${encodeURIComponent(payment.payment_number && payment.payment_number !== 'N / A' ? payment.payment_number : 'MOCK_QRIS_DATA_123')}`} 
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
							{@const isNoData = !payment.payment_number || payment.payment_number === 'N / A' || payment.payment_number === 'N/A'}
							{@const displayNo = isNoData ? '1170 0012 3456' : payment.payment_number}
							
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
										<button class="w-8 h-8 rounded-lg border-none flex items-center justify-center cursor-pointer transition-all {copied ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'}" onclick={() => copyToClipboard(displayNo.replace(/\s/g, ''))}>
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
								<span>After transferring, your payment will be verified automatically. {isNoData ? '(Mock Data for UI Testing)' : ''}</span>
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
							class="sprd-btn sprd-btn--primary w-full py-3 flex items-center justify-center disabled:opacity-50"
							onclick={handleSync}
							disabled={isSyncing || !isPending}
						>
							<RiRefreshLine class="h-4 w-4 mr-2 {isSyncing ? 'animate-spin' : ''}" />
							{isSyncing ? 'Checking...' : 'Check Payment Status'}
						</button>
						
						<button 
							class="sprd-btn sprd-btn--ghost w-full py-3 text-destructive hover:bg-destructive/10 disabled:opacity-50"
							onclick={handleCancel}
							disabled={isCanceling || !isPending}
						>
							Cancel Payment
						</button>
					</div>
				</div>
			</div>
		{/if}
	{:catch error}
		<div class="p-8 text-center text-destructive">
			Failed to load payment details.
		</div>
	{/await}
</div>
