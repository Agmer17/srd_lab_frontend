<script lang="ts">
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import AppSidebar from '$lib/components/appSidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import { currentUserStore } from '$lib/state/currentUser.svelte.js';
	import { Toaster, toast } from 'svelte-sonner';
	import type { ChatDataDto } from '$lib/types/chat.js';
	import ChatNotification from '$lib/components/chat/chatNotification.svelte';

	let { children, data } = $props();

	const currentPage = $derived.by(() => {
		const pathname = page.url.pathname;

		if (pathname.startsWith('/chat/')) {
			return 'Chat';
		}

		return pathname.split('/').pop() || 'Home';
	});

	$effect(() => {
		currentUserStore.data = data.user;
	});

	// WebSocket state
	let ws = $state<WebSocket | null>(null);
	let wsConnected = $state(false);

	$effect(() => {
		if (!browser || !data.accessToken) return;

		const socket = new WebSocket(`ws://localhost/api/ws/?token=${data.accessToken}`);

		socket.onopen = () => {
			wsConnected = true;
			console.log('[WS] Connected');
		};

		socket.addEventListener('message', (event) => {
			try {
				const payload = JSON.parse(event.data);
				if (payload.type === 'CHAT') {
					const chatData: ChatDataDto = payload.data;
					const isOnSameChatroom = page.url.pathname.includes(payload.data.chatroom_id);
					if (payload.sender_id === data.user?.id) return;
					if (isOnSameChatroom) return;

					toast.custom(ChatNotification, {
						componentProps: { chat: chatData },
						duration: 2000 // Beri waktu sedikit lama agar user bisa baca media type
					});
				}
			} catch (error) {
				console.log(error);
			}
		});

		socket.onerror = (error) => {
			console.error('[WS] Error:', error);
		};

		socket.onclose = () => {
			wsConnected = false;
			console.log('[WS] Disconnected');
		};

		ws = socket;
		return () => {
			socket.close();
			ws = null;
		};
	});

	setContext('ws', {
		get socket() {
			return ws;
		},
		get connected() {
			return wsConnected;
		},
		send: (payload: unknown) => {
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify(payload));
			} else {
				console.warn('[WS] Not connected, cannot send');
			}
		}
	});
</script>

<Toaster position="top-right" toastOptions={{ unstyled: true }} />
<Sidebar.Provider open={false}>
	<AppSidebar />
	<Sidebar.Inset class="flex h-screen flex-col bg-background">
		<!-- Header Top Bar -->
		<header
			class="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border bg-background/80 px-4 backdrop-blur-md transition-[height] group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2">
				<!-- Trigger dengan sedikit margin negatif agar sejajar secara visual -->
				<Sidebar.Trigger class="-ml-1" />

				<div class="mx-1 h-4 w-px bg-sidebar-border group-data-[collapsible=icon]:hidden"></div>

				<nav class="group-data-[collapsible=icon]:hidden">
					<p class="text-sm font-medium text-muted-foreground capitalize">
						{currentPage || 'home'}
					</p>
				</nav>
			</div>
		</header>

		<!-- Area Konten Utama -->
		<main class="flex min-h-0 flex-1 flex-col overflow-hidden">
			{@render children?.()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
