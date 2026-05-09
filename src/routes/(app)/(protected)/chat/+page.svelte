<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { RiMessage3Line, RiArrowLeftLine } from 'remixicon-svelte';
</script>

<div class="hidden h-full flex-col bg-background text-foreground md:flex">
	<!-- Mobile Top Bar (Tetap dipertahankan agar bisa kembali ke sidebar di HP) -->
	<div class="flex h-14 items-center border-b border-border px-4 md:hidden">
		<Button variant="ghost" size="icon" class="mr-2 text-muted-foreground">
			<RiArrowLeftLine class="h-5 w-5" />
		</Button>
		<span class="text-sm font-semibold tracking-tight">Chats</span>
	</div>

	<!-- Minimalist Empty State -->
	<div
		class="flex flex-1 animate-in flex-col items-center justify-center p-6 text-center duration-500 fade-in"
	>
		<!-- Icon Container yang Bersih (Memanfaatkan bg-muted dari CSS kamu) -->
		<div
			class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground ring-1 ring-border/50"
		>
			<RiMessage3Line class="h-8 w-8 opacity-70" />
		</div>

		<!-- Title -->
		<h2 class="text-[17px] font-semibold tracking-tight text-foreground">Select a conversation</h2>

		<!-- Description (Sangat ringkas) -->
		<p class="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-muted-foreground">
			Choose an existing chat or start a new one to begin messaging.
		</p>
	</div>
</div>
