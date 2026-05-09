<script lang="ts">
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import AppSidebar from '$lib/components/appSidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import { currentUserStore } from '$lib/state/currentUser.svelte.js';

	let { children, data } = $props();

	const currentPage = $derived.by(() => {
		const pathname = page.url.pathname;

		if (pathname.startsWith('/chat/')) {
			return 'Chat';
		}

		return pathname.split('/').pop() || 'Home';
	});

	// Sync user store — $effect valid karena data bisa berubah setelah invalidate
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

		socket.onmessage = (event) => {
			console.log('[WS] Message:', event.data);
		};

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

<Sidebar.Provider>
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
		<main class="flex flex-1 flex-col">
			{@render children?.()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
