<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Drawer from '$lib/components/ui/drawer';

	// Import dari svelte-remix
	import { RiGoogleFill } from 'remixicon-svelte';

	const handleGoogleLogin = async () => {
		goto('/api/auth/login/google');
	};
</script>

<main class="flex min-h-screen w-full flex-col overflow-hidden md:flex-row">
	<!-- 
    ========================================================================
    LEFT SECTION / TOP SECTION (Branding)
    ========================================================================
  -->
	<div
		class="flex flex-1 flex-col items-center justify-center bg-background bg-primary p-6 text-center md:w-1/2 md:flex-none md:items-start md:p-24 md:text-left"
	>
		<div class="flex max-w-sm flex-col gap-4 md:max-w-md">
			<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
				SRD Lab Creative
			</h1>
			<p class="text-base text-muted-foreground md:text-lg">
				Empowering next-generation digital experiences. Access your workspace to collaborate, build,
				and scale your creative ideas seamlessly.
			</p>
		</div>
	</div>

	<!-- 
    ========================================================================
    RIGHT SECTION (Desktop Auth Area)
    ========================================================================
  -->
	<div class="hidden border-l bg-background md:flex md:w-1/2 md:items-center md:justify-center">
		<Card.Root class="w-full max-w-sm shadow-sm">
			<Card.Header class="space-y-1 text-center">
				<Card.Title class="text-2xl font-semibold tracking-tight">Welcome</Card.Title>
				<Card.Description class="text-sm text-muted-foreground">
					Sign in or create an account to continue
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-3">
					<Button size="lg" class="w-full font-medium" onclick={handleGoogleLogin}>
						<RiGoogleFill class="mr-2 h-5 w-5" />
						Continue with Google
					</Button>

					<Button size="lg" variant="ghost" class="w-full font-medium" href="/">
						← Back to Home
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- 
    ========================================================================
    BOTTOM SECTION (Mobile Auth Area)
    FIX: Tambahkan 'md:hidden' langsung di class Drawer.Content
    ========================================================================
  -->
	<div class="md:hidden">
		<Drawer.Root open={true} dismissible={false} modal={false}>
			<Drawer.Content
				class="fixed right-0 bottom-0 left-0 mt-0 h-auto rounded-t-3xl border-t bg-background px-6 pt-4 pb-12 drop-shadow-2xl outline-none md:hidden"
			>
				<Drawer.Header class="px-0 text-center">
					<Drawer.Title class="text-2xl font-semibold tracking-tight">Welcome</Drawer.Title>
					<Drawer.Description class="text-sm text-muted-foreground">
						Sign in or create an account to continue
					</Drawer.Description>
				</Drawer.Header>
				<div class="mt-4 flex flex-col gap-4">
					<Button size="lg" class="w-full font-medium" onclick={handleGoogleLogin}>
						<RiGoogleFill class="mr-2 h-5 w-5" />
						Continue with Google
					</Button>
					<Button size="lg" variant="ghost" class="w-full font-medium" href="/">
						← Back to Home
					</Button>
				</div>
			</Drawer.Content>
		</Drawer.Root>
	</div>
</main>
