<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { Separator } from '$lib/components/ui/separator';

	import { Button } from '$lib/components/ui/button'; // <-- Tambahan

	import { Input } from '$lib/components/ui/input'; // <-- Tambahan

	import { formatDate } from '$lib/api_utils.js';

	import { RiMessage3Line, RiGroupLine, RiSearchLine, RiAddLine } from 'remixicon-svelte';

	import type { LatestChatDto } from '$lib/types/chat.js';

	import Badge from '$lib/components/ui/badge/badge.svelte';

	import Attachment2 from 'remixicon-svelte/icons/attachment-2';

	import { goto } from '$app/navigation';

	import { page } from '$app/state';

	let { children, data } = $props();

	let chatList = $state<LatestChatDto[]>(data.latest_chat ?? []);

	const activeChat = $derived.by(() => {
		const parts = page.url.pathname.split('/');

		return parts[1] === 'chat' && parts[2] ? parts[2] : null;
	});

	let searchQuery = $state('');

	let filtered = $derived(
		searchQuery.trim()
			? chatList.filter(
					(c) =>
						c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: chatList
	);

	function selectChat(lts: LatestChatDto) {
		if (lts.type == 'project') {
			goto('/chat/group/' + lts.project_id);
		} else {
			goto('/chat/personal/' + lts.chatroom_id);
		}
	}
</script>

<div class="flex h-screen w-full flex-col bg-background text-foreground md:flex-row">
	<!-- Sidebar -->

	<aside
		class:hidden={activeChat !== null}
		class="flex h-full w-full shrink-0 flex-col border-r border-border bg-background md:flex md:w-xs lg:w-[380px]"
	>
		<!-- Header (Jira Workspace Style) -->

		<div class="flex items-center justify-between px-4 py-3.5 font-bold">
			<div class="flex items-center">
				<Badge variant="default" class="h-8 rounded-lg  font-medium">
					<RiMessage3Line class="h-5 w-5" />

					<h3 class="text-sm font-semibold tracking-tight">Chats</h3>
				</Badge>
			</div>

			<!-- Menggunakan shadcn Button variant ghost & size icon -->

			<div class="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 text-muted-foreground"
					aria-label="New chat"
				>
					<RiAddLine class="h-5 w-5" />
				</Button>
			</div>
		</div>

		<!-- Search Bar -->

		<div class="px-4 pb-3">
			<!-- Menggunakan shadcn Input dengan relative positioning untuk icon -->

			<div class="relative flex items-center">
				<RiSearchLine class="absolute left-2.5 h-4 w-4 text-muted-foreground" />

				<Input
					type="text"
					placeholder="Search or start new chat"
					bind:value={searchQuery}
					class="h-9 w-full border-border pr-9 pl-9 text-[13px] shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
				/>
			</div>
		</div>

		<Separator class="opacity-50" />

		<!-- Chat List (WhatsApp Density + SaaS Cleanliness) -->

		<ScrollArea class="flex-1 overflow-y-auto">
			<div class="flex flex-col gap-0.5 p-2">
				{#each filtered as chat}
					{@const isActive = activeChat === chat.chatroom_id}

					<!-- List item tetap pakai button custom agar state hover & active lebih mudah dikontrol tanpa bentrok dengan base style Button shadcn -->

					<button
						onclick={() => selectChat(chat)}
						class="group flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors

    {isActive
							? 'bg-primary/25 text-primary-foreground'
							: 'hover:bg-primary/25 hover:text-primary-foreground'}"
					>
						<!-- Avatar: Bulat untuk DM, Kotak membulat (Jira style) untuk Group -->

						{#if chat.type === 'project'}
							<div
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"
							>
								<RiGroupLine class="h-5 w-5" />
							</div>
						{:else}
							<Avatar class="h-11 w-11 shrink-0 rounded-full border border-border">
								{#if chat.avatar}
									<AvatarImage src={chat.avatar} alt={chat.name} class="object-cover" />
								{/if}

								<AvatarFallback class="bg-muted text-xs font-medium text-muted-foreground">
									{chat.name.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						{/if}

						<!-- Message Content -->

						<div class="flex min-w-0 flex-1 flex-col gap-1">
							<!-- Top row: Name & Time -->

							<div class="flex items-center justify-between gap-2">
								<span class="truncate text-[14px] leading-none font-medium text-foreground">
									{chat.name}
								</span>

								<span
									class="shrink-0 text-[11px] font-medium tabular-nums

                                    {isActive ? 'text-foreground/70' : 'text-muted-foreground'}"
								>
									{chat.last_message_at ? formatDate(chat.last_message_at) : ''}
								</span>
							</div>

							<!-- Bottom row: WhatsApp style checkmark & Message preview -->

							<div class="flex items-center gap-1.5">
								<p
									class="flex min-w-0 items-center gap-1 truncate text-[13px] leading-snug

        {isActive ? 'text-foreground/80' : 'text-muted-foreground'}"
								>
									{#if chat.last_message}
										<!-- Cek apakah mengandung [media] dan bersihkan teksnya -->

										{@const hasMedia = chat.last_message.includes('[media]')}

										{@const cleanMsg = chat.last_message.replace('[media]', '').trim()}

										{#if hasMedia}
											<Attachment2 class="h-3.5 w-3.5 shrink-0 opacity-80" />

											<!-- Jika ada pesan teks lain, tampilkan. Jika hanya kirim gambar saja, tampilkan tulisan "Media" -->

											<span class="truncate">{cleanMsg !== '' ? cleanMsg : 'Media'}</span>
										{:else}
											<span class="truncate">{cleanMsg}</span>
										{/if}
									{:else}
										<span class="truncate">No messages yet...</span>
									{/if}
								</p>
							</div>
						</div>
					</button>
				{/each}

				{#if filtered.length === 0}
					<div class="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
							<RiSearchLine class="h-5 w-5 opacity-50" />
						</div>

						<p class="text-[13px] font-medium">
							{searchQuery ? 'No chats found' : 'No messages yet'}
						</p>
					</div>
				{/if}
			</div>
		</ScrollArea>
	</aside>

	<!-- Main Content Area -->

	<main class="flex flex-1 flex-col overflow-hidden bg-background">
		{@render children?.()}
	</main>
</div>
