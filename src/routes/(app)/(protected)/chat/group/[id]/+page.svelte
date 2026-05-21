<script lang="ts">
	import { getContext, tick } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import ChatInput from '$lib/components/chat/chatInput.svelte';
	import {
		RiErrorWarningLine,
		RiChatOffLine,
		RiGroupLine,
		RiArrowLeftLine
	} from 'remixicon-svelte';

	import { currentUserStore } from '$lib/state/currentUser.svelte.js';
	import ChatBubble from '$lib/components/chat/chatBubble.svelte';
	import { formatDate } from '$lib/api_utils.js';
	import { goto } from '$app/navigation';
	import type { ApiResponse } from '$lib/types/api.js';
	import type { ChatDataDto, PostChatDto } from '$lib/types/chat.js';
	import { postChatToForm } from '$lib/chat_utils.js';

	let { data } = $props();

	const CURRENT_USER_ID = $derived(currentUserStore.data?.id);

	let inputText = $state('');
	const ws = getContext<{
		socket: WebSocket | null;
		connected: boolean;
		send: (payload: unknown) => void;
	}>('ws');
	let wsMessages = $state<ChatDataDto[]>([]);

	function autoScroll(node: HTMLElement) {
		setTimeout(() => {
			node.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}, 50);

		return { destroy() {} };
	}

	async function handleSendMessage(chatData: PostChatDto) {
		if (chatData.text == '' && chatData.attachment.length == 0) {
			return;
		}
		inputText = '';
		chatData.room_id = data.roomData.chatroom_id;
		const form = postChatToForm(chatData);
		const res = await fetch('/api/chat/group/send/' + data.roomData.project_id, {
			method: 'POST',
			body: form
		});

		const apiResponse: ApiResponse<ChatDataDto> = await res.json();

		if (apiResponse.success) {
			console.log(apiResponse.data);
		} else {
			console.log(apiResponse.error);
		}

		await tick();

		document.getElementById('chat-scroll-anchor')?.scrollIntoView({ behavior: 'smooth' });
	}

	$effect(() => {
		const socket = ws.socket;
		if (!socket) return;

		function onMessage(event: MessageEvent) {
			try {
				const payload = JSON.parse(event.data);

				if (payload.type === 'CHAT' && payload.data.chatroom_id === data.roomData.chatroom_id) {
					wsMessages.push(payload.data);
				}
			} catch (e) {
				console.error('[WS] Parse error', e);
			}
		}

		socket.addEventListener('message', onMessage);

		return () => {
			socket.removeEventListener('message', onMessage);
		};
	});
</script>

<!-- ROOT LAYOUT: Flex Column + h-full + overflow-hidden biar ngerem scroll halaman dari luar -->

<div class="flex h-full w-full flex-col overflow-hidden bg-background">
	<!-- HEADER: Pake shrink-0 biar fix gak kegencet atau membesar -->

	<header
		class="flex shrink-0 items-center justify-between border-b bg-background/95 p-4 backdrop-blur hover:cursor-pointer supports-backdrop-filter:bg-background/80"
	>
		<div class="flex min-w-0 items-center gap-3">
			<!-- Back Button Mobile -->

			<Button
				variant="ghost"
				size="icon"
				class="h-10 w-10 shrink-0 rounded-full md:hidden"
				onclick={() => goto('/chat')}
			>
				<RiArrowLeftLine class="h-5 w-5" />
			</Button>

			<!-- Group Avatar -->

			<div
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-secondary shadow-sm"
			>
				<RiGroupLine class="h-5 w-5 text-secondary-foreground" />
			</div>

			<!-- Room Info -->

			<div class="flex min-w-0 flex-col justify-center">
				<h2 class="truncate text-[16px] leading-tight font-semibold text-foreground">
					{data.roomData.name}
				</h2>
				<p class="truncate text-sm text-[12px] leading-tight text-foreground/50">
					Click here to see the projects details
				</p>
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
			{:else if (!result.chats || result.chats.length === 0) && wsMessages.length === 0}
				<div
					class="flex flex-1 flex-col items-center justify-center space-y-4 p-6 text-center opacity-60"
				>
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<RiChatOffLine class="h-8 w-8 text-muted-foreground" />
					</div>

					<div>
						<h3 class="text-lg font-medium text-foreground">No message yet</h3>

						<p class="mt-1 text-sm text-muted-foreground">
							be the first one to send a chat in this group!
						</p>
					</div>
				</div>
			{:else}
				<ScrollArea class="h-full w-full overflow-y-auto px-6">
					<div class="flex flex-col pt-6 pb-4">
						<!-- Pesan dari server load -->
						{#each result.chats as chat, index}
							{@const showAvatar =
								index === 0 || result.chats[index - 1].sender_id !== chat.sender_id}
							<ChatBubble {chat} currentUserId={CURRENT_USER_ID} {showAvatar} {formatDate} />
						{/each}

						<!-- Pesan dari WS, di-append setelahnya -->
						{#each wsMessages as chat, index}
							{@const prevSenderId =
								index === 0
									? result.chats.at(-1)?.sender_id // compare dengan pesan terakhir dari load
									: wsMessages[index - 1].sender_id}
							{@const showAvatar = prevSenderId !== chat.sender_id}
							<ChatBubble {chat} currentUserId={CURRENT_USER_ID} {showAvatar} {formatDate} />
						{/each}

						<div id="chat-scroll-anchor" use:autoScroll class="h-1 w-full shrink-0"></div>
					</div>
				</ScrollArea>
			{/if}
		{/await}
	</div>

	<footer class="shrink-0 border-t bg-background p-4">
		<ChatInput bind:value={inputText} placeholder="Ketik pesan..." onSend={handleSendMessage} />
	</footer>
</div>
