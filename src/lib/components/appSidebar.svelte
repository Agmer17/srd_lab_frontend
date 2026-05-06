<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import {
		RiHome2Line,
		RiLayoutGridLine,
		RiFileListLine,
		RiBankCardLine,
		RiFolderLine,
		RiMessage2Line,
		RiUserLine,
		RiBarChartLine,
		RiLogoutBoxRLine
	} from 'remixicon-svelte';
	import { currentUserStore } from '$lib/state/currentUser.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Button from './ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';

	function getInitials(name?: string) {
		if (!name) return '';
		return name
			.split(' ')
			.slice(0, 2)
			.map((w) => w[0])
			.join('')
			.toUpperCase();
	}

	const publicItems = [
		{ title: 'Home', url: '/', icon: RiHome2Line },
		{ title: 'Products', url: '/products', icon: RiLayoutGridLine }
	];

	const userItems = [
		{ title: 'Orders', url: '/orders', icon: RiFileListLine },
		{ title: 'Payments', url: '/payments', icon: RiBankCardLine },
		{ title: 'Projects', url: '/projects', icon: RiFolderLine },
		{ title: 'Messages', url: '/messages', icon: RiMessage2Line }
	];

	const adminItems = [
		{ title: 'Users', url: '/user-management', icon: RiUserLine },
		{ title: 'Analytics', url: '/analytics', icon: RiBarChartLine }
	];

	function isActive(url: string) {
		return page.url.pathname === url;
	}

	const active = $derived(page.url.pathname === '/my-profile');
	function handleLogout() {
		goto('/api/auth/logout');
	}
</script>

<Sidebar.Root collapsible="icon">
	<!-- HEADER -->
	<Sidebar.Header
		class="border-b border-sidebar-border px-3 py-3.5 font-bold group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
	>
		<!-- Teks brand disembunyikan saat collapse -->
		<p
			class="text-xl font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden"
		>
			srdlab creative
		</p>

		{#if currentUserStore.data}
			<!-- Hapus border/background card saat collapse agar avatar rapi di tengah -->
			<Button
				variant={active ? 'default' : 'ghost'}
				onclick={() => goto('/my-profile')}
				class={cn(
					'group relative mt-2.5 flex h-auto w-full items-center justify-start gap-2.5 px-2.5 py-2 transition-all duration-200 hover:cursor-pointer',
					'border border-white/10 shadow-sm',
					// Saat tidak aktif, beri sedikit background agar terlihat seperti card (Notion style)
					!active && 'bg-white/5 hover:border-white/20 hover:bg-white/10',
					// Reset untuk mode sidebar icon (collapsible)
					'group-data-[collapsible=icon]:m-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0'
				)}
			>
				<!-- Avatar Section -->
				{#if currentUserStore.data.profile_picture}
					<Avatar
						class={cn(
							'h-[30px] w-[30px] shrink-0 transition-transform group-hover:scale-105',
							active ? 'border border-primary-foreground/20' : 'border border-white/10'
						)}
					>
						<AvatarImage
							src={currentUserStore.data.profile_picture}
							alt={currentUserStore.data.full_name}
							referrerpolicy="no-referrer"
						/>

						<AvatarFallback class="text-[11px] font-bold">
							{getInitials(currentUserStore.data.full_name)}
						</AvatarFallback>
					</Avatar>
				{:else}
					<div
						class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground shadow-sm transition-transform group-hover:scale-105"
					>
						{getInitials(currentUserStore.data.full_name)}
					</div>
				{/if}

				<!-- Info Text - Menggunakan group-hover agar tetap terbaca jelas -->
				<div class="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
					<p
						class={cn(
							'truncate text-[12px] font-bold transition-colors',
							active ? 'text-primary-foreground' : 'text-sidebar-foreground group-hover:text-white'
						)}
					>
						{currentUserStore.data.full_name}
					</p>

					<p
						class={cn(
							'truncate text-[10px] transition-colors',
							active
								? 'text-primary-foreground/80'
								: 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/90'
						)}
					>
						{currentUserStore.data.email}
					</p>
				</div>

				<!-- Role Badge -->
				<span
					class={cn(
						'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black tracking-tighter uppercase transition-all group-data-[collapsible=icon]:hidden',
						currentUserStore.data.global_role === 'ADMIN'
							? active
								? 'bg-primary-foreground text-primary shadow-sm'
								: 'bg-sidebar-primary text-sidebar-primary-foreground'
							: 'bg-white/10 text-sidebar-foreground/70 group-hover:bg-white/20 group-hover:text-white'
					)}
				>
					{currentUserStore.data.global_role === 'ADMIN' ? 'Admin' : 'User'}
				</span>
			</Button>
		{:else}
			<!-- Card guest dibuat transparan & teks disembunyikan saat collapse -->
			<div
				class="mt-2.5 flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent px-2.5 py-2 group-data-[collapsible=icon]:m-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"
			>
				<div
					class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-sidebar-border"
				>
					<RiUserLine class="h-3.5 w-3.5 text-sidebar-foreground/60" />
				</div>
				<div class="group-data-[collapsible=icon]:hidden">
					<p class="text-[11px] text-sidebar-foreground/50">Not signed in</p>
					<a href="/auth" class="text-[11px] font-medium text-sidebar-primary hover:underline">
						Sign in to continue
					</a>
				</div>
			</div>
		{/if}
	</Sidebar.Header>

	<!-- CONTENT -->
	<Sidebar.Content class="px-2 py-2 group-data-[collapsible=icon]:px-1">
		<!-- Public -->
		<Sidebar.Group class="p-0">
			<Sidebar.GroupLabel
				class="px-2 text-[10px] font-medium tracking-widest text-sidebar-foreground/40 uppercase group-data-[collapsible=icon]:hidden"
			>
				{currentUserStore.data ? 'Main' : 'Browse'}
			</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu class="gap-0.5">
					{#each publicItems as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={isActive(item.url)}
								class="h-8 gap-2 rounded-lg px-2.5 text-[13px] font-medium
                                    text-sidebar-foreground
                                    hover:bg-sidebar-accent hover:text-sidebar-foreground
                                    data-[active=true]:bg-sidebar-primary
                                    data-[active=true]:text-sidebar-primary-foreground
                                    data-[active=true]:hover:bg-sidebar-primary"
							>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon class="h-[15px] w-[15px] shrink-0" />
										<span class="group-data-[collapsible=icon]:hidden">{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		{#if currentUserStore.data}
			<div class="mx-2 my-2 h-px bg-sidebar-border/60 group-data-[collapsible=icon]:mx-1"></div>

			<!-- User activity -->
			<Sidebar.Group class="p-0">
				<Sidebar.GroupLabel
					class="px-2 text-[10px] font-medium tracking-widest text-sidebar-foreground/40 uppercase group-data-[collapsible=icon]:hidden"
				>
					My Activity
				</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu class="gap-0.5">
						{#each userItems as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={isActive(item.url)}
									class="h-8 gap-2 rounded-lg px-2.5 text-[13px] font-medium
                                        text-sidebar-foreground/75
                                        hover:bg-sidebar-accent hover:text-sidebar-foreground
                                        data-[active=true]:bg-sidebar-primary
                                        data-[active=true]:text-sidebar-primary-foreground"
								>
									{#snippet child({ props })}
										<a href={item.url} {...props}>
											<item.icon class="h-[15px] w-[15px] shrink-0" />
											<span class="group-data-[collapsible=icon]:hidden">{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>

			<!-- Admin only -->
			{#if currentUserStore.data.global_role === 'ADMIN'}
				<div class="mx-2 my-2 h-px bg-sidebar-border/60 group-data-[collapsible=icon]:mx-1"></div>

				<Sidebar.Group class="p-0">
					<Sidebar.GroupLabel
						class="px-2 text-[10px] font-medium tracking-widest text-sidebar-foreground/40 uppercase group-data-[collapsible=icon]:hidden"
					>
						Admin
					</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu class="gap-0.5">
							{#each adminItems as item (item.title)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton
										isActive={isActive(item.url)}
										class="h-8 gap-2 rounded-lg px-2.5 text-[13px] font-medium
                                            text-sidebar-primary/90
                                            hover:bg-sidebar-accent hover:text-sidebar-primary
                                            data-[active=true]:bg-sidebar-primary
                                            data-[active=true]:text-sidebar-primary-foreground"
									>
										{#snippet child({ props })}
											<a href={item.url} {...props}>
												<item.icon class="h-[15px] w-[15px] shrink-0" />
												<span class=" group-data-[collapsible=icon]:hidden">{item.title}</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			{/if}
		{:else}
			<!-- Box Guest CTA kita hilangin penuh saat collapse karena gak ada icon-nya -->
			<div
				class="mx-0 mt-2 rounded-lg border border-sidebar-border bg-sidebar-accent p-2.5 group-data-[collapsible=icon]:hidden"
			>
				<p class="mb-2 text-[11px] leading-relaxed text-sidebar-foreground/60">
					Sign in to access your orders, projects, and messages.
				</p>

				<a
					href="/auth"
					class="block w-full rounded-lg bg-sidebar-primary py-1.5 text-center text-xs font-semibold text-sidebar-primary-foreground transition-opacity hover:opacity-85"
				>
					Get started
				</a>
			</div>
		{/if}
	</Sidebar.Content>

	{#if currentUserStore.data}
		<Sidebar.Footer class="border-t border-sidebar-border p-2 group-data-[collapsible=icon]:p-1">
			<button
				onclick={handleLogout}
				class="group flex w-full items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2 text-[13px] font-semibold text-sidebar-foreground/80 transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 hover:bg-white/15 hover:text-sidebar-foreground"
			>
				<!-- Ikon pakai opacity biar gak terlalu 'menjerit' tapi tetap jelas -->
				<RiLogoutBoxRLine
					class="h-[16px] w-[16px] shrink-0 opacity-70 transition-transform group-hover:scale-110 group-hover:opacity-100"
				/>

				<span class="group-data-[collapsible=icon]:hidden">Sign out</span>
			</button>
		</Sidebar.Footer>
	{/if}
</Sidebar.Root>
