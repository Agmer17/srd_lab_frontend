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
				goto(`/payment/detail/${result.data.payment_id}`);
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
	<header class="sprd-header">
		<button class="sprd-icon-btn" style="margin-right: 4px" onclick={() => history.back()}>
			<i class="ri-arrow-left-line"></i>
		</button>
		<span class="sprd-crumb">Complete payment</span>
	</header>

	{#await data.orderPromise}
		<div class="pay-page flex items-center justify-center p-8 animate-pulse text-muted-foreground">
			Loading order details...
		</div>
	{:then orderData}
		{#if orderData.error || !orderData.order}
			<div class="pay-page flex items-center justify-center p-8 text-destructive">
				{orderData.error || 'Order not found.'}
			</div>
		{:else}
			{@const order = orderData.order}
			{@const fee = Math.round(order.ordered_price * 0.01)}
			{@const total = order.ordered_price + fee}

			<div class="pay-page">
				<div class="pay-grid">

					<!-- Left: Method selection -->
					<div class="pay-left">
						<div class="pay-section-label">Choose payment method</div>

						<div class="pay-methods">
							<!-- QRIS Option -->
							<button
								class="pay-method {methodGroup === 'qris' ? 'pay-method--active' : ''}"
								onclick={() => handleGroupSelect('qris')}
							>
								<i class="ri-qr-code-line"></i>
								<div class="pay-method-text text-left">
									<div class="pay-method-label">
										QRIS
										<span class="pay-method-rec">Recommended</span>
									</div>
									<div class="pay-method-sub">Scan with any banking / e-wallet app</div>
								</div>
								<div class="pay-method-radio {methodGroup === 'qris' ? 'pay-method-radio--on' : ''}">
									{#if methodGroup === 'qris'}
										<i class="ri-check-line"></i>
									{/if}
								</div>
							</button>

							<!-- Virtual Account Option -->
							<button
								class="pay-method {methodGroup === 'bank_transfer' ? 'pay-method--active' : ''}"
								onclick={() => handleGroupSelect('bank_transfer')}
							>
								<i class="ri-bank-line"></i>
								<div class="pay-method-text text-left">
									<div class="pay-method-label">
										Virtual Account (VA)
									</div>
									<div class="pay-method-sub">Automatic verification via Bank Transfer</div>
								</div>
								<div class="pay-method-radio {methodGroup === 'bank_transfer' ? 'pay-method-radio--on' : ''}">
									{#if methodGroup === 'bank_transfer'}
										<i class="ri-check-line"></i>
									{/if}
								</div>
							</button>
						</div>

						<!-- Bank Selection Panel -->
						{#if methodGroup === 'bank_transfer'}
							<div class="pay-panel">
								<div style="font-size: 13px; font-weight: 600; margin-bottom: 14px;">Select your bank</div>
								<div class="pay-wallet-grid">
									{#each bankMethods as b}
										<button 
											class="pay-wallet-tile {selectedMethod === b.id ? 'ring-2 ring-primary ring-offset-1' : ''}" 
											onclick={() => selectedMethod = b.id}
										>
											<div class="pay-wallet-mark" style="background: {selectedMethod === b.id ? 'var(--primary)' : 'var(--secondary)'}; color: {selectedMethod === b.id ? '#fff' : 'inherit'}">
												{b.name.charAt(0)}
											</div>
											<div style="font-size: 12px; font-weight: 600; margin-top: 6px;">{b.name}</div>
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<div style="margin-top: 24px;">
							<button 
								class="sprd-btn sprd-btn--primary w-full py-4 text-[15px] flex items-center justify-center disabled:opacity-50" 
								onclick={handlePayment}
								disabled={isProcessing}
							>
								{#if isProcessing}
									<i class="ri-loader-4-line animate-spin mr-2"></i> Processing...
								{:else}
									Process Payment <i class="ri-arrow-right-line ml-2"></i>
								{/if}
							</button>
						</div>
					</div>

					<!-- Right: Order summary -->
					<div class="pay-summary">
						<div class="pay-summary-h">Order summary</div>

						<div class="pay-summary-product-row">
							<div class="pay-summary-thumb" style="background: var(--primary-foreground); color: var(--primary)">
								<i class="ri-box-3-line"></i>
							</div>
							<div>
								<div style="font-size: 14px; font-weight: 600;">{order.product?.name || 'Service Package'}</div>
								<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted-foreground); margin-top: 3px;">
									{order.id?.substring(0, 8).toUpperCase() || order.id}
								</div>
							</div>
						</div>

						<div class="pay-summary-lines">
							<div class="pay-line">
								<span>Service price</span>
								<span>{formatPrice(order.ordered_price)}</span>
							</div>
							<div class="pay-line">
								<span>Processing fee (1%)</span>
								<span>{formatPrice(fee)}</span>
							</div>
						</div>

						<div class="pay-total-row">
							<span>Total</span>
							<span class="pay-total-num">{formatPrice(total)}</span>
						</div>

						<div class="pay-summary-note">
							<i class="ri-shield-check-line" style="color: var(--primary); flex-shrink: 0;"></i>
							Payments are secured and processed automatically.
						</div>
					</div>

				</div>
			</div>
		{/if}
	{:catch error}
		<div class="pay-page flex items-center justify-center p-8 text-destructive">
			Failed to load checkout details.
		</div>
	{/await}
</div>

<style>
/* ================================================================
   HEADER
   ================================================================ */
.sprd-header {
  height: 52px; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  background: oklch(0.9816 0.0017 247.84 / 0.85); backdrop-filter: blur(10px);
  border-bottom: 1px solid oklch(0.6 0.002 17 / .3);
  position: sticky; top: 0; z-index: 20; flex-shrink: 0;
}
.sprd-crumb { font-size: 14px; font-weight: 500; color: var(--muted-foreground); letter-spacing: -0.01em; }
.sprd-icon-btn { position: relative; width: 36px; height: 36px; border-radius: 8px; background: transparent; border: none; cursor: pointer; color: var(--muted-foreground); font-size: 17px; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.sprd-icon-btn:hover { background: oklch(0.85 0.005 250); color: var(--foreground); }

/* ================================================================
   ATOMS
   ================================================================ */
.sprd-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 36px; padding: 0 14px; border-radius: 6.5px;
  font-family: inherit; font-size: 14px; font-weight: 500; letter-spacing: -0.01em;
  border: 1px solid transparent; cursor: pointer; transition: all .15s; white-space: nowrap;
}
.sprd-btn:active:not(:disabled) { transform: translateY(1px); }
.sprd-btn:disabled { opacity: .45; cursor: not-allowed; }
.sprd-btn--primary { background: var(--primary); color: var(--primary-foreground); }
.sprd-btn--primary:hover:not(:disabled) { background: oklch(0.86 0.17 91 / 0.82); }

/* ================================================================
   PAYMENT PAGE
   ================================================================ */
.pay-page { padding: 32px 28px 80px; max-width: 1024px; margin: 0 auto; }
.pay-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: start; }
.pay-section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 12px; }
.pay-methods { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.pay-method { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 12px; background: var(--card); border: 1px solid var(--border); cursor: pointer; font-family: inherit; text-align: left; transition: all .15s; box-shadow: var(--shadow-xs); }
.pay-method > i:first-child { font-size: 22px; color: var(--muted-foreground); flex-shrink: 0; }
.pay-method-text { flex: 1; min-width: 0; }
.pay-method-label { font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.pay-method-rec { background: var(--primary); color: var(--primary-foreground); padding: 1px 7px; border-radius: 99px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.pay-method-sub { font-size: 11.5px; color: var(--muted-foreground); margin-top: 2px; }
.pay-method-radio { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .15s; }
.pay-method-radio--on { background: var(--secondary); border-color: var(--secondary); color: #fff; font-size: 11px; }
.pay-method--active { border-color: var(--secondary); box-shadow: 0 0 0 3px oklch(0.38 0.14 265 / .15); }
.pay-method--active > i:first-child { color: var(--secondary); }

.pay-panel { background: var(--card); border-radius: 14px; padding: 20px; box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08), var(--shadow-xs); display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
.pay-wallet-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.pay-wallet-tile { padding: 14px 8px; border-radius: 10px; border: 1px solid var(--border); background: transparent; cursor: pointer; font-family: inherit; transition: all .15s; text-align: center; }
.pay-wallet-tile:hover { border-color: var(--secondary); box-shadow: 0 0 0 2px oklch(0.38 0.14 265 / .15); }
.pay-wallet-mark { width: 38px; height: 38px; border-radius: 10px; color: #fff; font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto; }

.pay-summary { background: var(--card); border-radius: 14px; padding: 22px; box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08), var(--shadow-xs); position: sticky; top: 68px; }
.pay-summary-h { font-size: 14px; font-weight: 600; margin: 0 0 16px; }
.pay-summary-product-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: oklch(0.97 0.002 248); border-radius: 10px; margin-bottom: 16px; }
.pay-summary-thumb { width: 42px; height: 42px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: rgba(255,255,255,0.9); flex-shrink: 0; }
.pay-summary-lines { display: flex; flex-direction: column; gap: 8px; padding-bottom: 12px; border-bottom: 1px dashed oklch(0.85 0 0); margin-bottom: 12px; }
.pay-line { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted-foreground); }
.pay-line span:last-child { color: var(--foreground); font-family: 'JetBrains Mono', monospace; font-weight: 500; }
.pay-total-row { display: flex; justify-content: space-between; align-items: baseline; }
.pay-total-row > span:first-child { font-size: 14px; font-weight: 600; }
.pay-total-num { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; letter-spacing: -0.025em; }
.pay-summary-note { display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; color: var(--muted-foreground); margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); line-height: 1.5; }

@media (max-width: 900px) {
  .pay-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .pay-wallet-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
