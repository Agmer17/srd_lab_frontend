<script lang="ts">
	import {
		RiVideoLine,
		RiFileTextLine,
		RiMicLine,
		RiCameraLine,
		RiMapPinLine
	} from 'remixicon-svelte';

	import type { ChatDataDto } from '$lib/types/chat';
	import { initials } from '$lib/string_utils';

	let { chat }: { chat: ChatDataDto } = $props();

	const mediaPreview = $derived.by(() => {
		if (!chat.chat_media || chat.chat_media.length === 0) return null;

		const firstMedia = chat.chat_media[0];
		const mime = firstMedia.media_type;

		if (mime.includes('image')) {
			return { icon: RiCameraLine, label: 'Photo' };
		} else if (mime.includes('video')) {
			return { icon: RiVideoLine, label: 'Video' };
		} else if (mime.includes('audio')) {
			return { icon: RiMicLine, label: 'Voice message' };
		} else if (mime.includes('pdf') || mime.includes('document')) {
			return { icon: RiFileTextLine, label: 'Document' };
		} else if (mime.includes('location')) {
			return { icon: RiMapPinLine, label: 'Location' };
		}

		return { icon: RiFileTextLine, label: 'File' };
	});

	// Saat ada attachment, kasih ruang lebih sedikit untuk teks
	const maxTextLength = $derived(mediaPreview ? 30 : 60);

	const textSnippet = $derived(
		chat.text && chat.text.length > maxTextLength
			? chat.text.substring(0, maxTextLength) + '...'
			: chat.text
	);
</script>

<div
	class="flex w-full max-w-[380px] gap-3.5 rounded-2xl border border-border bg-popover p-4 shadow-xl backdrop-blur-sm transition-all hover:bg-accent/50 active:scale-[0.98]"
>
	<!-- Avatar -->
	<div class="relative shrink-0">
		{#if chat.sender_profile_picture}
			<img
				src={chat.sender_profile_picture}
				alt={chat.sender_full_name}
				class="h-12 w-12 rounded-full object-cover shadow-sm ring-1 ring-border"
			/>
		{:else}
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground shadow-inner ring-1 ring-border"
			>
				{initials(chat.sender_full_name)}
			</div>
		{/if}
	</div>

	<!-- Content -->
	<div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
		<!-- Header: label + nama -->
		<div class="flex flex-col">
			<span class="text-xs font-medium text-secondary">new message from</span>
			<span class="truncate text-sm leading-tight font-semibold text-foreground">
				{chat.sender_full_name}
			</span>
		</div>

		<!-- Preview: media badge dan/atau teks -->
		<div class="flex min-w-0 items-center gap-1.5 text-sm">
			{#if mediaPreview}
				<!-- Badge media, tidak boleh shrink -->
				<div class="flex shrink-0 items-center gap-1 font-medium text-sky-600 dark:text-sky-400">
					<mediaPreview.icon class="h-3.5 w-3.5" />
					<span class="text-xs">{mediaPreview.label}</span>
				</div>
			{/if}

			{#if mediaPreview && textSnippet}
				<span class="shrink-0 text-xs text-border">·</span>
			{/if}

			{#if textSnippet}
				<p class="min-w-0 truncate text-xs text-muted-foreground/90">
					{textSnippet}
				</p>
			{/if}

			<!-- Kalau tidak ada teks dan tidak ada media sama sekali -->
			{#if !mediaPreview && !chat.text}
				<p class="text-xs text-muted-foreground/60 italic">No content</p>
			{/if}
		</div>
	</div>
</div>
