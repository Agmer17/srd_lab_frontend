<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { RiArrowLeftLine } from 'remixicon-svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { initials } from '$lib/string_utils';
	import type { PageData } from './$types';
	import type { ChatDataDto, PersonalPostChatDto, PostChatDto } from '$lib/types/chat';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import ChatBubble from '$lib/components/chat/chatBubble.svelte';
	import { formatDate } from '$lib/api_utils';
	import { currentUserStore } from '$lib/state/currentUser.svelte';
	import ChatInput from '$lib/components/chat/chatInput.svelte';
	import { postChatToForm } from '$lib/chat_utils';
	import type { ApiResponse } from '$lib/types/api';

	let { data }: { data: PageData } = $props();
	let chats = $state<ChatDataDto[]>([]);
	const CURRENT_USER_ID = $derived(currentUserStore.data?.id);
	let inputText = $state<string>('');

	async function handleSendMessage(chatData: PostChatDto) {
		if (chatData.text == '' && chatData.attachment.length == 0) {
			return;
		}
		inputText = '';

		const toSend: PersonalPostChatDto = {
			text: chatData.text,
			attachment: chatData.attachment
		};

		const form = postChatToForm(toSend);
		console.log(form);
		const res = await fetch('/api/chat/personal/send/' + data.user?.id, {
			method: 'POST',
			body: form
		});

		const apiResponse: ApiResponse<ChatDataDto> = await res.json();

		if (apiResponse.success) {
			// PAKSA SvelteKit fetch ulang data terbaru dari server
			await invalidateAll();

			// Baru pindah halaman
			goto('/chat/personal/' + apiResponse.data.chatroom_id);
		} else {
			console.log(apiResponse.error);
		}
	}
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-background">
	<header
		class="shrink-0 items-center justify-between border-b bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/80"
	>
		<div class="flex min-w-0 items-center gap-3">
			<!-- Back Button -->

			<Button
				variant="ghost"
				size="icon"
				class="h-10 w-10 shrink-0 rounded-full md:hidden"
				onclick={() => goto('/chat')}
			>
				<RiArrowLeftLine class="h-5 w-5" />
			</Button>

			<!-- Avatar -->

			<Avatar.Root class="h-11 w-11 shrink-0 rounded-full border border-border shadow-sm">
				<Avatar.Image
					src={data.user?.profile_picture}
					alt={data.user?.full_name}
					class="object-cover"
				/>

				<Avatar.Fallback class="bg-secondary text-xs font-medium text-secondary-foreground">
					{initials(data.user?.full_name)}
				</Avatar.Fallback>
			</Avatar.Root>

			<!-- Room Info -->

			<div class="flex min-w-0 flex-col justify-center">
				<h2 class="truncate text-[15px] leading-tight font-semibold text-foreground">
					{data.user?.full_name}
				</h2>
			</div>
		</div>
	</header>

	<div class="relative flex flex-1 flex-col overflow-hidden bg-background">
		<ScrollArea class="h-full w-full overflow-y-auto px-6">
			<div class="flex flex-col pt-6 pb-4">
				<!-- Pesan dari server load -->
				{#each chats as chat, index}
					{@const showAvatar = index === 0 || chats[index - 1].sender_id !== chat.sender_id}
					<ChatBubble {chat} currentUserId={CURRENT_USER_ID} {showAvatar} {formatDate} />
				{/each}
			</div>
		</ScrollArea>
	</div>

	<footer class="shrink-0 border-t bg-background p-4">
		<ChatInput bind:value={inputText} placeholder="type something..." onSend={handleSendMessage} />
	</footer>
</div>
