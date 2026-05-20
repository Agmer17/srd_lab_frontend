<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';

	import {
		RiAttachmentLine,
		RiSendPlaneFill,
		RiCloseLine,
		RiVideoLine,
		RiMusicLine,
		RiFileLine,
		RiFilePdfLine,
		RiFileWordLine,
		RiFileExcelLine,
		RiFilePptLine,
		RiFileTextLine,
		RiErrorWarningLine,
		RiCheckLine
	} from 'remixicon-svelte';
	import type { FileCategory, PostChatDto } from '$lib/types/chat';
	import { generateId } from '$lib/string_utils';
	import { categorize, formatSize } from '$lib/chat_utils';

	// ─── Props ────────────────────────────────────────────────────────────────

	type Props = {
		/** Current text input value — bind:value */
		value?: string;
		/** Placeholder teks input */
		placeholder?: string;
		/** Max ukuran file dalam MB, default 25 */
		maxFileSizeMb?: number;
		/** Max jumlah file sekaligus, default 10 */
		maxFiles?: number;
		/** Dipanggil saat user submit (tekan kirim) */
		onSend?: (payload: PostChatDto) => void | Promise<void>;
		/** Disabled state keseluruhan */
		disabled?: boolean;
	};

	export type SendPayload = {
		text: string;
		files: File[];
	};

	let {
		value = $bindable(''),
		placeholder = 'Ketik pesan...',
		maxFileSizeMb = 25,
		maxFiles = 10,
		onSend,
		disabled = false
	}: Props = $props();

	// ─── State ────────────────────────────────────────────────────────────────

	type FileEntry = {
		file: File;
		id: string;
		previewUrl: string | null; // hanya untuk image
		error: string | null;
	};

	let fileEntries = $state<FileEntry[]>([]);
	let fileInputEl = $state<HTMLInputElement | null>(null);
	let sending = $state(false);

	const showOverlay = $derived(fileEntries.length > 0);
	const hasValidFiles = $derived(fileEntries.some((e) => !e.error));
	const canSend = $derived(!disabled && !sending && (value.trim().length > 0 || hasValidFiles));

	// ─── File Handling ────────────────────────────────────────────────────────

	function handleFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		input.value = ''; // reset supaya bisa pilih file sama lagi

		const remaining = maxFiles - fileEntries.length;
		const toProcess = files.slice(0, remaining);

		for (const file of toProcess) {
			const entry: FileEntry = {
				file,
				id: generateId(),
				previewUrl: null,
				error: null
			};

			// Validasi ukuran
			if (file.size > maxFileSizeMb * 1024 * 1024) {
				entry.error = `Ukuran melebihi ${maxFileSizeMb}MB`;
			}

			// Buat preview URL untuk gambar
			if (!entry.error && categorize(file) === 'image') {
				entry.previewUrl = URL.createObjectURL(file);
			}

			fileEntries.push(entry);
		}
	}

	function removeEntry(id: string) {
		const idx = fileEntries.findIndex((e) => e.id === id);
		if (idx === -1) return;
		const entry = fileEntries[idx];
		if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
		fileEntries.splice(idx, 1);
	}

	function clearAll() {
		for (const e of fileEntries) {
			if (e.previewUrl) URL.revokeObjectURL(e.previewUrl);
		}
		fileEntries = [];
	}

	function openFilePicker() {
		fileInputEl?.click();
	}

	async function handleSend(e: Event) {
		e.preventDefault();
		if (!canSend) return;

		sending = true;
		try {
			await onSend?.({
				text: value,
				attachment: fileEntries.filter((e) => !e.error).map((e) => e.file),
				room_id: ''
			});
			value = '';
			clearAll();
		} finally {
			sending = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (canSend) handleSend(e);
		}
	}

	// Cleanup saat komponen destroy
	$effect(() => {
		return () => {
			for (const e of fileEntries) {
				if (e.previewUrl) URL.revokeObjectURL(e.previewUrl);
			}
		};
	});
</script>

<!-- Hidden native file input -->
<input
	bind:this={fileInputEl}
	type="file"
	multiple
	accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
	class="hidden"
	onchange={handleFileChange}
/>

<div class="relative flex flex-col">
	<!-- ── FILE PREVIEW OVERLAY ─────────────────────────────────────────────── -->
	{#if showOverlay}
		<div
			class="absolute right-0 bottom-full left-0 z-20 mb-1 flex max-h-72 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg"
		>
			<!-- Overlay Header -->
			<div class="flex shrink-0 items-center justify-between px-3 py-2">
				<div class="flex items-center gap-2">
					<Badge variant="secondary" class="text-[11px] font-semibold tabular-nums">
						{fileEntries.length} file
					</Badge>
					{#if fileEntries.some((e) => e.error)}
						<span class="flex items-center gap-1 text-[11px] text-destructive">
							<RiErrorWarningLine class="h-3.5 w-3.5" />
							Ada file bermasalah
						</span>
					{/if}
				</div>
				<Button
					variant="ghost"
					size="icon"
					class="h-6 w-6 text-muted-foreground hover:text-foreground"
					onclick={clearAll}
					aria-label="Hapus semua file"
				>
					<RiCloseLine class="h-4 w-4" />
				</Button>
			</div>

			<Separator />

			<!-- File List -->
			<ScrollArea class="flex-1 overflow-y-auto">
				<div class="flex flex-col gap-1 p-2">
					{#each fileEntries as entry (entry.id)}
						{@const cat = categorize(entry.file)}
						<div
							class="group flex items-center gap-3 rounded-lg p-2 transition-colors
								{entry.error ? 'border border-destructive/20 bg-destructive/10' : 'bg-muted/40 hover:bg-muted/70'}"
						>
							<!-- Thumbnail / Icon -->
							<div
								class="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background"
							>
								{#if cat === 'image' && entry.previewUrl}
									<img
										src={entry.previewUrl}
										alt={entry.file.name}
										class="h-full w-full object-cover"
									/>
								{:else if cat === 'video'}
									<RiVideoLine class="h-6 w-6 text-muted-foreground" />
								{:else if cat === 'audio'}
									<RiMusicLine class="h-6 w-6 text-muted-foreground" />
								{:else if cat === 'pdf'}
									<RiFilePdfLine class="h-6 w-6 text-destructive" />
								{:else if cat === 'word'}
									<RiFileWordLine class="h-6 w-6 text-primary" />
								{:else if cat === 'excel'}
									<RiFileExcelLine class="h-6 w-6 text-chart-4" />
								{:else if cat === 'ppt'}
									<RiFilePptLine class="h-6 w-6 text-accent" />
								{:else if cat === 'text'}
									<RiFileTextLine class="h-6 w-6 text-muted-foreground" />
								{:else}
									<RiFileLine class="h-6 w-6 text-muted-foreground" />
								{/if}
							</div>

							<!-- File Info -->
							<div class="flex min-w-0 flex-1 flex-col gap-0.5">
								<p class="truncate text-[13px] leading-tight font-medium text-foreground">
									{entry.file.name}
								</p>
								{#if entry.error}
									<p class="flex items-center gap-1 text-[11px] text-destructive">
										<RiErrorWarningLine class="h-3 w-3 shrink-0" />
										{entry.error}
									</p>
								{:else}
									<p class="text-[11px] text-muted-foreground">
										{formatSize(entry.file.size)}
										<span class="mx-1 opacity-40">·</span>
										{cat.toUpperCase()}
									</p>
								{/if}
							</div>

							<!-- Remove Button -->
							<Button
								variant="ghost"
								size="icon"
								class="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
								onclick={() => removeEntry(entry.id)}
								aria-label="Hapus file"
							>
								<RiCloseLine class="h-4 w-4" />
							</Button>
						</div>
					{/each}

					<!-- Tambah lebih banyak file jika belum penuh -->
					{#if fileEntries.length < maxFiles}
						<button
							type="button"
							onclick={openFilePicker}
							class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
						>
							<RiAttachmentLine class="h-4 w-4" />
							Tambah file lagi
						</button>
					{/if}
				</div>
			</ScrollArea>
		</div>
	{/if}

	<!-- ── FOOTER INPUT BAR ───────────────────────────────────────────────────── -->
	<form class="flex items-end gap-3" onsubmit={handleSend}>
		<!-- Attachment Button -->
		<Button
			type="button"
			variant="ghost"
			size="icon"
			class="h-12 w-12 shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground
				{showOverlay ? 'text-primary' : ''}"
			onclick={openFilePicker}
			{disabled}
			aria-label="Lampirkan file"
		>
			<RiAttachmentLine class="h-6 w-6" />
		</Button>

		<!-- Text Input -->
		<div
			class="relative flex flex-1 items-center rounded-xl border border-transparent bg-muted/50 shadow-sm transition-colors focus-within:border-primary/30 focus-within:bg-background"
		>
			<textarea
				bind:value
				{placeholder}
				rows={1}
				disabled={disabled || sending}
				onkeydown={handleKeydown}
				class="min-h-12 w-full resize-none border-0 bg-transparent px-4 py-3 text-[14px] text-foreground shadow-none outline-none placeholder:text-muted-foreground focus:ring-0"
				style="field-sizing: content; max-height: 120px;"
			></textarea>
		</div>

		<!-- Send Button -->
		<Button
			type="submit"
			size="icon"
			disabled={!canSend}
			class="h-12 w-12 shrink-0 rounded-full transition-all duration-200
				{canSend
				? 'scale-100 bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
				: 'scale-95 bg-muted text-muted-foreground opacity-70'}"
		>
			{#if sending}
				<RiCheckLine class="h-5 w-5 animate-pulse" />
			{:else}
				<RiSendPlaneFill class="ml-0.5 h-5 w-5" />
			{/if}
			<span class="sr-only">Kirim pesan</span>
		</Button>
	</form>
</div>
