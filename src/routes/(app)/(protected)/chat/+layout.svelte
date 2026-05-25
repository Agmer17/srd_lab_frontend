<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { formatDate } from '$lib/api_utils.js';
	import { RiMessage3Line, RiGroupLine, RiSearchLine, RiAddLine } from 'remixicon-svelte';
	import type { ChatDataDto, LatestChatDto } from '$lib/types/chat.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Attachment2 from 'remixicon-svelte/icons/attachment-2';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { initials } from '$lib/string_utils.js';
	import { getContext } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { currentUserStore } from '$lib/state/currentUser.svelte.js';
	import type { ApiResponse } from '$lib/types/api.js';
	import type { User } from '$lib/types/user.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let { children, data } = $props();
	const ws = getContext<{
		socket: WebSocket | null;
		connected: boolean;
		send: (payload: unknown) => void;
	}>('ws');

	let chatList = $state<LatestChatDto[]>(data.latest_chat ?? []);
	$effect(() => {
		if (data.latest_chat) {
			chatList = data.latest_chat;
		}
	});

	let scrollViewport: HTMLDivElement;

	let isDesktop = new MediaQuery('(min-width: 768px)');
	let newChatDialog = $state<boolean>(false);
	let avaibleUser = $state<User[]>();
	let loadingUsers = $state(false);

	async function openDialog() {
		newChatDialog = true;

		if (currentUserStore.data?.global_role == 'ADMIN') {
			loadingUsers = true;

			const res = await fetch('/api/user/all');
			const apiResponse: ApiResponse<User[]> = await res.json();

			if (!apiResponse.success) {
				avaibleUser = [];
			} else {
				avaibleUser = apiResponse.data.filter((u) => u.id !== currentUserStore.data?.id);
			}

			loadingUsers = false;
		} else {
			loadingUsers = true;

			const res = await fetch('/api/user/all/admin');
			const apiResponse: ApiResponse<User[]> = await res.json();

			if (!apiResponse.success) {
				avaibleUser = [];
			} else {
				avaibleUser = apiResponse.data.filter((u) => u.id !== currentUserStore.data?.id);
			}

			loadingUsers = false;
		}
	}

	const activeChat = $derived.by(() => {
		const parts = page.url.pathname.split('/');

		// /chat/group/:id
		// /chat/personal/:id

		if (parts[1] !== 'chat') return null;

		const type = parts[2];
		const id = parts[3];

		if (!type || !id) return null;

		return {
			type,
			id
		};
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

	$effect(() => {
		const socket = ws.socket;
		if (!socket) return;

		function onMessage(event: MessageEvent) {
			try {
				const payload = JSON.parse(event.data);

				if (payload.type === 'CHAT') {
					// incoming di-cast sesuai ChatDataDto yang kamu miliki
					const incoming: ChatDataDto = payload.data;

					// Cari apakah chatroom ini sudah ada di list sidebar
					const idx = chatList.findIndex((c) => c.chatroom_id === incoming.chatroom_id);

					if (idx !== -1) {
						// KASUS 1: Chatroom sudah terdaftar, perbarui pesan terakhir
						chatList[idx] = {
							...chatList[idx],
							last_message: incoming.text,
							last_message_at: incoming.created_at
						};

						// Pindahkan ke baris paling atas (paling baru)
						const [updatedItem] = chatList.splice(idx, 1);
						chatList.unshift(updatedItem);
					} else {
						// KASUS 2: Chatroom baru dari orang yang belum pernah dichat sebelumnya

						// Mapping data dari ChatDataDto ke LatestChatDto
						const newChat: LatestChatDto = {
							chatroom_id: incoming.chatroom_id,

							// Jika chatroom_id mengandung penanda project atau ada field tambahan, sesuaikan di sini.
							// Untuk amannya default ke 'personal'
							type: 'personal',
							project_id: null,

							name: incoming.sender_full_name,
							avatar: incoming.sender_profile_picture || null,
							other_user_id: incoming.sender_id,
							last_message: incoming.text,
							last_message_at: incoming.created_at
						};

						// Masukkan ke urutan pertama di sidebar
						chatList.unshift(newChat);
					}
				}
			} catch (e) {
				console.error('[WS] Gagal memproses pesan masuk:', e);
			}
		}

		socket.addEventListener('message', onMessage);
		return () => socket.removeEventListener('message', onMessage);
	});

	function startNewChat(user: User) {
		const existChat = chatList.find((u) => u.other_user_id === user.id);
		newChatDialog = false;

		if (!existChat) {
			goto('/chat/new/' + user.id);

			return;
		}

		goto('/chat/personal/' + existChat.chatroom_id);
	}
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-background text-foreground md:flex-row">
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
					onclick={() => openDialog()}
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
			<div class="flex flex-col gap-0.5 p-2" bind:this={scrollViewport}>
				{#each filtered as chat}
					{@const isActive =
						activeChat &&
						((activeChat.type === 'group' && activeChat.id === chat.project_id) ||
							(activeChat.type === 'personal' && activeChat.id === chat.chatroom_id))}

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
							<Avatar class="h-11 w-11 shrink-0 rounded-full border border-border">
								<AvatarFallback class="bg-secondary text-xs font-medium text-secondary-foreground">
									<RiGroupLine class="h-5 w-5" />
								</AvatarFallback>
							</Avatar>
						{:else}
							<Avatar class="h-11 w-11 shrink-0 rounded-full border border-border">
								{#if chat.avatar}
									<AvatarImage
										src={chat.avatar}
										alt={chat.name}
										class="object-cover"
										referrerpolicy="no-referrer"
									/>
								{/if}

								<AvatarFallback class="bg-secondary text-xs font-medium text-secondary-foreground">
									{initials(chat.name)}
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

	{#if isDesktop.current}
		<Dialog.Root bind:open={newChatDialog}>
			<Dialog.Content
				class="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
			>
				<!-- Header -->
				<div class="flex flex-col gap-1.5 border-b bg-background p-5 shadow-sm">
					<Dialog.Header>
						<Dialog.Title class="text-lg font-semibold tracking-tight">
							Start a new chat
						</Dialog.Title>
						<Dialog.Description class="text-sm text-muted-foreground">
							Choose a user to start a conversation.
						</Dialog.Description>
					</Dialog.Header>
				</div>

				<!-- User List -->
				<ScrollArea class="h-[450px] w-full bg-muted/10">
					<div class="flex flex-col gap-1 p-3">
						{#if loadingUsers}
							{#each Array(6) as _}
								<div class="flex items-center gap-3 rounded-md p-2">
									<Skeleton class="h-10 w-10 shrink-0 rounded-full" />
									<div class="flex flex-1 flex-col gap-2">
										<Skeleton class="h-3.5 w-32" />
										<Skeleton class="h-3 w-48" />
									</div>
								</div>
							{/each}
						{:else if avaibleUser && avaibleUser.length > 0}
							<div class="mb-2 px-2 pt-1 text-xs font-semibold tracking-wide text-muted-foreground">
								Avaible Users to contact
							</div>
							{#each avaibleUser as user}
								<button
									onclick={() => startNewChat(user)}
									class="group flex w-full items-center gap-3 rounded-md border border-transparent p-2 text-left transition-all outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-1 focus-visible:ring-ring"
								>
									<Avatar class="h-10 w-10 shrink-0 border border-border/50">
										{#if user.profile_picture}
											<AvatarImage
												src={user.profile_picture}
												alt={user.full_name}
												class="object-cover"
											/>
										{/if}
										<AvatarFallback class="bg-muted/50 text-xs font-medium">
											{initials(user.full_name)}
										</AvatarFallback>
									</Avatar>

									<div class="flex min-w-0 flex-1 flex-col">
										<div class="flex items-center gap-2">
											<p
												class="truncate text-sm leading-none font-medium text-foreground group-hover:text-foreground/90"
											>
												{user.full_name}
											</p>
											{#if user.global_role === 'ADMIN'}
												<Badge
													variant="default"
													class="h-4 rounded-sm px-1 text-[9px] font-semibold tracking-wider"
												>
													ADMIN
												</Badge>
											{/if}
										</div>
										<p class="mt-1 truncate text-xs text-muted-foreground">
											{user.email}
										</p>
									</div>
								</button>
							{/each}
						{:else}
							<div class="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
									<!-- SVG Ikon kontak kosong untuk mempercantik empty state -->
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="h-6 w-6 text-muted-foreground"
									>
										<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
										<circle cx="9" cy="7" r="4" />
										<line x1="19" x2="19" y1="8" y2="14" />
										<line x1="22" x2="16" y1="11" y2="11" />
									</svg>
								</div>
								<div>
									<p class="text-sm font-medium text-foreground">No users found</p>
									<p class="text-xs text-muted-foreground">
										There are no available users to chat with.
									</p>
								</div>
							</div>
						{/if}
					</div>
				</ScrollArea>
			</Dialog.Content>
		</Dialog.Root>
	{:else}
		<!-- KODE UNTUK MOBILE (DRAWER) -->
		<Drawer.Root bind:open={newChatDialog}>
			<Drawer.Content class="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0">
				<!-- Header Mobile -->
				<div class="flex flex-col gap-1.5 border-b bg-background p-5 shadow-sm">
					<Drawer.Header class="p-0 text-left">
						<Drawer.Title class="text-lg font-semibold tracking-tight">
							Start a new chat
						</Drawer.Title>
						<Drawer.Description class="text-sm text-muted-foreground">
							Choose a user to start a conversation.
						</Drawer.Description>
					</Drawer.Header>
				</div>

				<!-- User List Mobile -->
				<ScrollArea class="h-[450px] w-full bg-muted/10">
					<div class="flex flex-col gap-1 p-3 pb-8">
						<!-- Ditambah sedikit padding bottom untuk space navigasi mobile -->
						{#if loadingUsers}
							{#each Array(6) as _}
								<div class="flex items-center gap-3 rounded-md p-2">
									<Skeleton class="h-10 w-10 shrink-0 rounded-full" />
									<div class="flex flex-1 flex-col gap-2">
										<Skeleton class="h-3.5 w-32" />
										<Skeleton class="h-3 w-48" />
									</div>
								</div>
							{/each}
						{:else if avaibleUser && avaibleUser.length > 0}
							<div class="mb-2 px-2 pt-1 text-xs font-semibold tracking-wide text-muted-foreground">
								Avaible Users to contact
							</div>
							{#each avaibleUser as user}
								<button
									onclick={() => startNewChat(user)}
									class="group flex w-full items-center gap-3 rounded-md border border-transparent p-2 text-left transition-all outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-1 focus-visible:ring-ring"
								>
									<Avatar class="h-10 w-10 shrink-0 border border-border/50">
										{#if user.profile_picture}
											<AvatarImage
												src={user.profile_picture}
												alt={user.full_name}
												class="object-cover"
											/>
										{/if}
										<AvatarFallback class="bg-muted/50 text-xs font-medium">
											{initials(user.full_name)}
										</AvatarFallback>
									</Avatar>

									<div class="flex min-w-0 flex-1 flex-col">
										<div class="flex items-center gap-2">
											<p
												class="truncate text-sm leading-none font-medium text-foreground group-hover:text-foreground/90"
											>
												{user.full_name}
											</p>
											{#if user.global_role === 'ADMIN'}
												<Badge
													variant="default"
													class="h-4 rounded-sm px-1 text-[9px] font-semibold tracking-wider"
												>
													ADMIN
												</Badge>
											{/if}
										</div>
										<p class="mt-1 truncate text-xs text-muted-foreground">
											{user.email}
										</p>
									</div>
								</button>
							{/each}
						{:else}
							<div class="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="h-6 w-6 text-muted-foreground"
									>
										<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
										<circle cx="9" cy="7" r="4" />
										<line x1="19" x2="19" y1="8" y2="14" />
										<line x1="22" x2="16" y1="11" y2="11" />
									</svg>
								</div>
								<div>
									<p class="text-sm font-medium text-foreground">No users found</p>
									<p class="text-xs text-muted-foreground">
										There are no available users to chat with.
									</p>
								</div>
							</div>
						{/if}
					</div>
				</ScrollArea>
			</Drawer.Content>
		</Drawer.Root>
	{/if}
	<!-- Main Content Area -->

	<main class="flex flex-1 flex-col overflow-hidden bg-background">
		{@render children?.()}
	</main>
</div>
