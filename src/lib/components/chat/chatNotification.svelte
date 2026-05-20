<script lang="ts">
	// Ganti Lucide jadi Remix Icon
	import {
		RiImageLine,
		RiVideoLine,
		RiFileTextLine,
		RiMicLine,
		RiCameraLine,
		RiMapPinLine
	} from 'remixicon-svelte';

	import type { ChatDataDto } from '$lib/types/chat';

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

	const textSnippet = $derived(
		chat.text && chat.text.length > 60 ? chat.text.substring(0, 60) + '...' : chat.text
	);
</script>

<div
	class="flex w-full max-w-[380px] gap-3.5 rounded-2xl border border-border bg-popover p-4 shadow-xl backdrop-blur-sm transition-all hover:bg-accent/50 active:scale-[0.98]"
>
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
				{chat.sender_full_name.charAt(0).toUpperCase()}
			</div>
		{/if}
	</div>

	<div class="flex min-w-0 flex-1 flex-col justify-center">
		<div class="flex flex-col justify-between">
			<span class="truncate text-sm font-semibold text-secondary"> new message from </span>
			<span class="truncate text-sm font-semibold text-foreground">
				{chat.sender_full_name}
			</span>
		</div>

		<div class="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
			{#if mediaPreview}
				<div class="flex shrink-0 items-center gap-1 font-medium text-sky-600 dark:text-sky-400">
					<mediaPreview.icon />
					<span>{mediaPreview.label}</span>
				</div>

				{#if chat.text}
					<span class="text-border">•</span>
				{/if}
			{/if}

			{#if chat.text}
				<p class="flex-1 truncate text-muted-foreground/90">
					{textSnippet}
				</p>
			{/if}
		</div>
	</div>
</div>
