<script lang="ts">
	import { tick } from 'svelte';

	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

	import { Button } from '$lib/components/ui/button';

	import { Input } from '$lib/components/ui/input';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { Skeleton } from '$lib/components/ui/skeleton';

	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';

	import {
		RiSendPlaneFill,
		RiAttachmentLine,
		RiErrorWarningLine,
		RiChatOffLine,
		RiImageLine,
		RiCloseLine,
		RiFileTextLine,
		RiDownloadCloud2Line,
		RiMusic2Line
	} from 'remixicon-svelte';

	import { initials } from '$lib/string_utils';

	import type { ChatDataDto } from '$lib/types/chat';

	import { formatDate } from '$lib/api_utils.js';

	import { currentUserStore } from '$lib/state/currentUser.svelte.js';

	let { data } = $props();

	const CURRENT_USER_ID = $derived(currentUserStore.data?.id);

	let inputText = $state('');

	let selectedFiles = $state<File[]>([]);

	// Svelte Action pengganti $effect biar gak ala-ala React

	function autoScroll(node: HTMLElement) {
		setTimeout(() => {
			node.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}, 50);

		return { destroy() {} };
	}

	async function handleSendMessage(e: Event) {
		e.preventDefault();

		if (!inputText.trim() && selectedFiles.length === 0) return;

		console.log('Sending message:', inputText);

		inputText = '';

		selectedFiles = [];

		await tick();

		document.getElementById('chat-scroll-anchor')?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

{#snippet chatBubble(chat: ChatDataDto, isCurrentUser: boolean, showAvatar: boolean)}
	<div class="group flex items-end gap-3 {isCurrentUser ? 'flex-row-reverse' : 'flex-row'} mb-4">
		<div class="flex w-8 shrink-0 flex-col items-center justify-end">
			{#if showAvatar && !isCurrentUser}
				<Avatar class="h-8 w-8 shadow-sm">
					<AvatarImage src={chat.sender_profile_picture} alt={chat.sender_full_name} />

					<AvatarFallback class="bg-primary/10 text-xs text-primary"
						>{initials(chat.sender_full_name)}</AvatarFallback
					>
				</Avatar>
			{/if}
		</div>

		<div
			class="flex flex-col {isCurrentUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]"
		>
			{#if showAvatar && !isCurrentUser}
				<span class="mb-1 ml-1 text-xs font-medium text-muted-foreground">
					{chat.sender_full_name}
				</span>
			{/if}

			<div class="flex w-full flex-col gap-2">
				{#if chat.chat_media && chat.chat_media.length > 0}
					<div class="flex flex-wrap gap-2 {isCurrentUser ? 'justify-end' : 'justify-start'}">
						{#each chat.chat_media as media}
							{#if media.media_type === 'image'}
								<div class="relative overflow-hidden rounded-md border bg-muted shadow-sm">
									<img
										src={`/api/chat/media/${media.media_access_url.split('/').pop()}`}
										alt="Gambar terlampir"
										class="max-h-[300px] min-h-[100px] w-auto min-w-[150px] object-cover transition-opacity hover:opacity-90"
										loading="lazy"
										onerror={(e) => {
											const target = e.target as HTMLImageElement;

											target.style.display = 'none';

											target.parentElement?.classList.add(
												'flex',

												'items-center',

												'justify-center',

												'p-4'
											);

											target.parentElement!.innerHTML =
												'<span class="text-xs text-muted-foreground flex flex-col items-center gap-1"><RiImageLine class="h-5 w-5"/> Image unavailable</span>';
										}}
									/>
								</div>
							{:else if media.media_type === 'video'}
								<video
									src={media.media_access_url}
									controls
									class="max-h-[300px] w-full rounded-md border bg-black shadow-sm"
								>
									<track kind="captions" />
								</video>
							{:else if media.media_type === 'audio'}
								<div
									class="flex min-w-[250px] items-center gap-3 rounded-md border bg-card p-2 shadow-sm"
								>
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
									>
										<RiMusic2Line class="h-5 w-5" />
									</div>

									<audio src={media.media_access_url} controls class="h-10 w-full" />
								</div>
							{:else if media.media_type === 'document'}
								<a
									href={media.media_access_url}
									target="_blank"
									rel="noopener noreferrer"
									class="group/doc flex w-[250px] items-center gap-3 rounded-md border bg-card p-3 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
								>
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary"
									>
										<RiFileTextLine class="h-5 w-5" />
									</div>

									<div class="flex flex-1 flex-col overflow-hidden">
										<span class="truncate font-medium">Dokumen Terlampir</span>

										<span class="text-xs text-muted-foreground uppercase"
											>{media.media_access_url.split('.').pop() || 'FILE'}</span
										>
									</div>

									<RiDownloadCloud2Line
										class="h-5 w-5 text-muted-foreground transition-transform group-hover/doc:-translate-y-0.5"
									/>
								</a>
							{/if}
						{/each}
					</div>
				{/if}

				{#if chat.text}
					<div
						class="relative px-4 py-2.5 text-[15px] leading-relaxed shadow-sm {isCurrentUser
							? 'rounded-2xl rounded-tr-sm bg-primary text-primary-foreground'
							: 'rounded-2xl rounded-tl-sm border bg-muted text-foreground'}"
					>
						<p class="break-words whitespace-pre-wrap">{chat.text}</p>

						<div class="mt-1 flex justify-end opacity-70">
							<span class="text-[10px] tracking-wide">{formatDate(chat.created_at)}</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

<!-- ROOT LAYOUT: Flex Column + h-full + overflow-hidden biar ngerem scroll halaman dari luar -->

<div class="flex h-full w-full flex-col overflow-hidden bg-background">
	<!-- HEADER: Pake shrink-0 biar fix gak kegencet atau membesar -->

	<header class="flex h-[72px] shrink-0 items-center justify-between border-b bg-background px-6">
		<div class="flex items-center gap-4">
			<Avatar class="h-11 w-11 shadow-sm">
				<AvatarFallback class="bg-primary/10 font-semibold text-primary">GC</AvatarFallback>
			</Avatar>

			<div class="flex flex-col justify-center">
				<h2 class="text-base leading-tight font-semibold text-foreground">Nama Chatroom</h2>
			</div>
		</div>
	</header>

	<!-- AREA CHAT: Pake flex-1 dan overflow-hidden biar ScrollArea shadcn jalan sempurna di dalemnya -->

	<div class="relative flex flex-1 flex-col overflow-hidden bg-background">
		{#await data.chatDataPromise}
			<div class="flex-1 space-y-6 p-6">
				{#each Array(5) as _, i}
					<div class="flex w-full items-end gap-3 {i % 2 !== 0 ? 'flex-row-reverse' : ''}">
						{#if i % 2 === 0}
							<Skeleton class="h-8 w-8 shrink-0 rounded-full" />
						{/if}

						<Skeleton
							class="h-16 w-[60%] sm:w-[40%] {i % 2 !== 0
								? 'rounded-2xl rounded-tr-sm'
								: 'rounded-2xl rounded-tl-sm'}"
						/>
					</div>
				{/each}
			</div>
		{:then result}
			{#if result.error}
				<div class="flex flex-1 items-center justify-center p-6">
					<Alert variant="destructive" class="max-w-md shadow-sm">
						<RiErrorWarningLine class="h-5 w-5" />

						<AlertTitle>Gagal memuat obrolan</AlertTitle>

						<AlertDescription>{result.error}</AlertDescription>
					</Alert>
				</div>
			{:else if !result.chats || result.chats.length === 0}
				<div
					class="flex flex-1 flex-col items-center justify-center space-y-4 p-6 text-center opacity-60"
				>
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<RiChatOffLine class="h-8 w-8 text-muted-foreground" />
					</div>

					<div>
						<h3 class="text-lg font-medium text-foreground">Belum ada obrolan</h3>

						<p class="mt-1 text-sm text-muted-foreground">
							Kirim pesan pertama untuk memulai percakapan di grup ini.
						</p>
					</div>
				</div>
			{:else}
				<!-- Pake h-full di dalem flex-1 biar auto detect tinggi container -->

				<ScrollArea class="h-full w-full overflow-y-auto px-6">
					<div class="flex flex-col pt-6 pb-4">
						{#each result.chats as chat, index}
							{@const isCurrentUser = chat.sender_id === CURRENT_USER_ID}

							{@const showAvatar =
								index === 0 || result.chats[index - 1].sender_id !== chat.sender_id}

							{@render chatBubble(chat, isCurrentUser, showAvatar)}
						{/each}

						<!-- Trigger action scroll di sini, no $effect react-reactan -->

						<div id="chat-scroll-anchor" use:autoScroll class="h-1 w-full shrink-0"></div>
					</div>
				</ScrollArea>
			{/if}
		{/await}
	</div>

	<!-- FOOTER / INPUT: Pake shrink-0 biar ngunci di bawah gak ikut ke-scroll -->

	<footer class="shrink-0 border-t bg-background p-4">
		{#if selectedFiles.length > 0}
			<div class="flex items-center gap-3 overflow-x-auto pb-3">
				<div
					class="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-md border bg-muted shadow-sm"
				>
					<RiImageLine class="h-6 w-6 text-muted-foreground" />

					<Button
						variant="destructive"
						size="icon"
						class="absolute -top-2 -right-2 h-6 w-6 scale-0 rounded-full shadow-md transition-transform group-hover:scale-100"
						onclick={() => (selectedFiles = [])}
					>
						<RiCloseLine class="h-4 w-4" />
					</Button>
				</div>
			</div>
		{/if}

		<form class="flex items-end gap-3" onsubmit={handleSendMessage}>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				class="h-12 w-12 shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			>
				<RiAttachmentLine class="h-6 w-6" />

				<span class="sr-only">Lampirkan file</span>
			</Button>

			<div
				class="relative flex flex-1 items-center rounded-xl border border-transparent bg-muted/50 shadow-sm transition-colors focus-within:border-primary/30 focus-within:bg-background"
			>
				<Input
					bind:value={inputText}
					placeholder="Ketik pesan..."
					class="min-h-12 w-full border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0"
					autocomplete="off"
				/>
			</div>

			<Button
				type="submit"
				size="icon"
				disabled={!inputText.trim() && selectedFiles.length === 0}
				class="h-12 w-12 shrink-0 rounded-full transition-all duration-200 {inputText.trim() ||
				selectedFiles.length > 0
					? 'scale-100 bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
					: 'scale-95 bg-muted text-muted-foreground opacity-70'}"
			>
				<RiSendPlaneFill class="ml-1 h-5 w-5" />

				<span class="sr-only">Kirim pesan</span>
			</Button>
		</form>
	</footer>
</div>
