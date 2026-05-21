<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		RiMusic2Line,
		RiFileTextLine,
		RiDownloadCloud2Line,
		RiZoomInLine
	} from 'remixicon-svelte';
	import type { ChatDataDto } from '$lib/types/chat';
	import { initials } from '$lib/string_utils';

	interface Props {
		chat: ChatDataDto;
		currentUserId: string | undefined;
		showAvatar?: boolean;
		formatDate?: (date: string) => string;
	}

	let { chat, currentUserId, showAvatar = false, formatDate = defaultFormatDate }: Props = $props();

	// ── Derived ──────────────────────────────────────────────
	const isCurrentUser = $derived(chat.sender_id === currentUserId);
	const images = $derived(chat.chat_media?.filter((m) => m.media_type === 'image') ?? []);
	const nonImageMedia = $derived(chat.chat_media?.filter((m) => m.media_type !== 'image') ?? []);
	const gridCols = $derived(images.length === 1 ? 1 : images.length === 2 ? 2 : 3);
	const maxImgH = $derived(images.length === 1 ? 'max-h-72' : 'max-h-40');

	// ── Lightbox state ────────────────────────────────────────
	let lightboxOpen = $state(false);
	let lightboxIndex = $state(0);
	const lightboxSrc = $derived(
		images[lightboxIndex]
			? `/api/chat/media/${images[lightboxIndex].media_access_url.split('/').pop()}`
			: ''
	);

	function openLightbox(index: number) {
		lightboxIndex = index;
		lightboxOpen = true;
	}

	// ── Helpers ───────────────────────────────────────────────
	function defaultFormatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleTimeString('id-ID', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}

	function attachmentSource(url: string): string {
		return `/api/chat/media/${url.split('/').pop()}`;
	}

	function documentSource(url: string): string {
		return `/api/chat/media/${url.split('/').pop()}/download`;
	}
</script>

<!-- ─── Wrapper row ──────────────────────────────────────────── -->
<div class="group mb-3 flex items-end gap-2 {isCurrentUser ? 'flex-row-reverse' : 'flex-row'}">
	<!-- Avatar slot -->
	<div class="w-8 shrink-0">
		{#if showAvatar && !isCurrentUser}
			<Avatar class="h-8 w-8 ring-2 ring-background">
				<AvatarImage src={chat.sender_profile_picture ?? ''} alt={chat.sender_full_name} />
				<AvatarFallback class="bg-primary/10 text-[10px] font-medium text-primary">
					{initials(chat.sender_full_name)}
				</AvatarFallback>
			</Avatar>
		{/if}
	</div>

	<!-- Content column -->
	<div
		class="flex max-w-[80%] min-w-0 flex-col gap-1.5 sm:max-w-[70%] {isCurrentUser
			? 'items-end'
			: 'items-start'}"
	>
		{#if showAvatar && !isCurrentUser}
			<span class="px-1 text-[11px] font-medium text-muted-foreground">
				{chat.sender_full_name}
			</span>
		{/if}

		<!-- ── Image grid ──────────────────────────────────────── -->
		{#if images.length > 0}
			<div
				class="overflow-hidden rounded-2xl border shadow-sm
					{isCurrentUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}"
				style="display: grid;
					grid-template-columns: repeat({gridCols}, 1fr);
					gap: 2px;
					background: hsl(var(--border));"
			>
				{#each images.slice(0, 4) as media, i}
					<button
						type="button"
						class="group/img relative block overflow-hidden bg-muted
							focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none
							{images.length === 3 && i === 2 ? 'col-span-3' : ''}
							{images.length > 4 && i === 3 ? 'relative' : ''}"
						onclick={() => openLightbox(i)}
					>
						<img
							src={attachmentSource(media.media_access_url)}
							alt="Gambar {i + 1}"
							class="{maxImgH} h-full w-full object-cover
								transition-transform duration-200 group-hover/img:scale-105"
							style="min-height: 80px;"
							loading="lazy"
						/>

						<!-- Zoom hint overlay -->
						<div
							class="absolute inset-0 flex items-center justify-center
							bg-black/0 transition-colors duration-150
							group-hover/img:bg-black/20"
						>
							<RiZoomInLine
								class="h-6 w-6 scale-75 text-white opacity-0 drop-shadow
									transition-all duration-150
									group-hover/img:scale-100 group-hover/img:opacity-100"
							/>
						</div>

						<!-- "+N more" overlay pada thumbnail ke-4 -->
						{#if images.length > 4 && i === 3}
							<div
								class="absolute inset-0 flex items-center justify-center
								bg-black/55 text-xl font-semibold text-white"
							>
								+{images.length - 4}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		<!-- ── Non-image media ─────────────────────────────────── -->
		{#if nonImageMedia.length > 0}
			<div class="flex w-full flex-col gap-2">
				{#each nonImageMedia as media}
					{@const bubbleCorner = isCurrentUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}

					{#if media.media_type === 'video'}
						<div class="overflow-hidden rounded-2xl {bubbleCorner} border shadow-sm">
							<video
								src={attachmentSource(media.media_access_url)}
								controls
								class="max-h-64 w-full bg-black"
								preload="metadata"
							>
								<track kind="captions" />
							</video>
						</div>
					{:else if media.media_type === 'audio'}
						<div
							class="flex min-w-[240px] items-center gap-2.5 rounded-2xl {bubbleCorner}
							border bg-card px-3 py-2 shadow-sm"
						>
							<div
								class="flex h-8 w-8 shrink-0 items-center justify-center
								rounded-full bg-primary/10"
							>
								<RiMusic2Line class="h-4 w-4 text-primary" />
							</div>
							<audio
								src={attachmentSource(media.media_access_url)}
								controls
								class="h-8 min-w-0 flex-1"
							></audio>
						</div>
					{:else if media.media_type === 'document'}
						<a
							href={documentSource(media.media_access_url)}
							target="_blank"
							rel="noopener noreferrer"
							class="group/doc flex w-56 items-center gap-3 rounded-2xl {bubbleCorner}
								border bg-card px-3 py-2.5 shadow-sm
								transition-colors hover:bg-accent"
						>
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center
								rounded-lg bg-primary/10"
							>
								<RiFileTextLine class="h-4 w-4 text-primary" />
							</div>
							<div class="flex min-w-0 flex-1 flex-col">
								<span class="truncate text-[13px] font-medium">Document</span>
							</div>
							<RiDownloadCloud2Line
								class="h-4 w-4 shrink-0 text-muted-foreground/60
									transition-transform group-hover/doc:-translate-y-0.5"
							/>
						</a>
					{/if}
				{/each}
			</div>
		{/if}

		<!-- ── Text bubble ─────────────────────────────────────── -->
		{#if chat.text}
			<div
				class="relative px-3.5 py-2 text-[14.5px] leading-relaxed shadow-sm
					{isCurrentUser
					? 'rounded-2xl rounded-tr-sm bg-primary text-primary-foreground'
					: 'rounded-2xl rounded-tl-sm border bg-muted text-foreground'}"
			>
				<p class="break-words whitespace-pre-wrap">{chat.text}</p>
				<div class="mt-0.5 flex items-center justify-end gap-1 opacity-60">
					<span class="text-[10px] tracking-wide">{formatDate(chat.created_at)}</span>
				</div>
			</div>
		{:else if images.length > 0 || nonImageMedia.length > 0}
			<span class="px-1 text-[10px] text-muted-foreground/60">
				{formatDate(chat.created_at)}
			</span>
		{/if}
	</div>
</div>

<!-- ─── Lightbox ────────────────────────────────────────────── -->
<Dialog.Root bind:open={lightboxOpen}>
	<Dialog.Content
		class="fixed top-1/2 left-1/2 flex h-[100dvh] w-[100dvw] max-w-none -translate-x-1/2 -translate-y-1/2 items-center justify-center border-0 bg-background/70 p-4 shadow-none backdrop-blur-sm"
	>
		<Dialog.Title class="sr-only">Preview gambar</Dialog.Title>

		<div class="flex w-full max-w-6xl flex-col items-center justify-center">
			<!-- Image wrapper (Sekarang jadi container relative untuk tombol) -->
			<div
				class="group relative flex h-[80dvh] w-full items-center justify-center overflow-hidden rounded-xl"
			>
				<img
					src={lightboxSrc}
					alt="Preview gambar {lightboxIndex + 1}"
					class="h-full w-full object-contain shadow-2xl"
				/>

				{#if images.length > 1}
					<!-- Overlay Navigasi (Tombol di atas gambar) -->

					<!-- Tombol Prev (Kiri) -->
					<button
						type="button"
						class="absolute top-1/2 left-4 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/80 disabled:opacity-30 lg:opacity-0 lg:group-hover:opacity-100"
						disabled={lightboxIndex === 0}
						onclick={() => (lightboxIndex -= 1)}
						aria-label="Gambar sebelumnya"
					>
						<!-- Menggunakan karakter teks besar untuk panah, bisa diganti icon -->
						<span class="font-mono text-3xl leading-none" aria-hidden="true">‹</span>
					</button>

					<!-- Tombol Next (Kanan) -->
					<button
						type="button"
						class="absolute top-1/2 right-4 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/80 disabled:opacity-30 lg:opacity-0 lg:group-hover:opacity-100"
						disabled={lightboxIndex === images.length - 1}
						onclick={() => (lightboxIndex += 1)}
						aria-label="Gambar selanjutnya"
					>
						<span class="font-mono text-3xl leading-none" aria-hidden="true">›</span>
					</button>

					<!-- Indikator Angka (Pojok kanan atas) -->
					<div
						class="absolute top-4 right-4 z-10 rounded-full bg-black/60 px-3 py-1 text-sm text-white/90 backdrop-blur-sm select-none"
					>
						{lightboxIndex + 1} / {images.length}
					</div>
				{/if}
			</div>

			{#if images.length > 1}
				<!-- Dots (Tetap di bawah gambar untuk navigasi cepat) -->
				<div class="mt-4 flex flex-wrap justify-center gap-2">
					{#each images as _, i}
						<button
							type="button"
							aria-label="Ke gambar {i + 1}"
							class="h-2 rounded-full transition-all duration-200
                            {i === lightboxIndex
								? 'w-8 bg-primary'
								: 'w-2 bg-primary/40 hover:bg-primary/70'}"
							onclick={() => (lightboxIndex = i)}
						></button>
					{/each}
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
