<script lang="ts">
	import AppSidebar from '$lib/components/appSidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import { page } from '$app/state';
	import { currentUserStore } from '$lib/state/currentUser.svelte.js';

	let { children, data } = $props();
	$effect(() => {
		currentUserStore.data = data.user;
	});
</script>

<Sidebar.Provider>
	<AppSidebar />

	<!-- Sidebar.Inset otomatis mengatur lebar konten saat sidebar collapse -->
	<Sidebar.Inset class="flex flex-col bg-background">
		<!-- Header Top Bar -->
		<header
			class="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border bg-background/80 px-4 backdrop-blur-md transition-[height] group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2">
				<!-- Trigger dengan sedikit margin negatif agar sejajar secara visual -->
				<Sidebar.Trigger class="-ml-1" />

				<!-- Separator kecil biar makin elegan -->
				<div class="mx-1 h-4 w-px bg-sidebar-border group-data-[collapsible=icon]:hidden"></div>

				<!-- Breadcrumb atau Nama Halaman (Opsional) -->
				<nav class="group-data-[collapsible=icon]:hidden">
					<p class="text-sm font-medium text-muted-foreground capitalize">
						{page.url.pathname.split('/').pop() || 'Home'}
					</p>
				</nav>
			</div>
		</header>

		<!-- Area Konten Utama -->
		<main class="flex flex-1 flex-col gap-4 p-4 sm:p-6">
			{@render children?.()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
