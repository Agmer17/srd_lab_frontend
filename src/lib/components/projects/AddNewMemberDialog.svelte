<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { RiUserAddLine, RiSearchLine, RiUserLine } from 'remixicon-svelte';
	import type { User } from '$lib/types/user';
	import type { ProjectMember, ProjectRole } from '$lib/types/projects';
	import { initials } from '$lib/string_utils';
	import type { ApiResponse } from '$lib/types/api';
	import { MediaQuery } from 'svelte/reactivity';

	interface Props {
		open?: boolean;
		existingMembers: ProjectMember[];
		onInvite: (userId: string, roleId: string) => Promise<void>;
	}

	let { open = $bindable(false), existingMembers, onInvite }: Props = $props();

	// ── Data ──────────────────────────────────────────────────
	let allUsers = $state<User[]>([]);
	let allRoles = $state<ProjectRole[]>([]);
	let loading = $state(false);
	let submitting = $state(false);

	// ── Form ──────────────────────────────────────────────────
	let search = $state('');
	let selectedUserId = $state('');
	let selectedRoleId = $state('');

	// ── Derived ───────────────────────────────────────────────
	let existingMemberUserIds = $derived(new Set(existingMembers.map((m) => m.user.id)));

	let filteredUsers = $derived(
		allUsers
			.filter((u) => !existingMemberUserIds.has(u.id))
			.filter((u) => {
				const q = search.toLowerCase();
				return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
			})
	);

	let selectedUser = $derived(allUsers.find((u) => u.id === selectedUserId));
	let selectedRole = $derived(allRoles.find((r) => r.id === selectedRoleId));
	let canSubmit = $derived(!!selectedUserId && !!selectedRoleId && !submitting);

	// ── Fetch on open ─────────────────────────────────────────
	$effect(() => {
		if (!open) return;
		fetchData();
	});

	async function fetchData() {
		loading = true;
		try {
			const [usersRes, rolesRes] = await Promise.all([
				fetch('/api/user/all'),
				fetch('/api/project-role/all')
			]);
			const allUserResponse: ApiResponse<User[]> = await usersRes.json();
			if (allUserResponse.success) {
				allUsers = allUserResponse.data;
			}

			const allRolesResponse: ApiResponse<ProjectRole[]> = await rolesRes.json();
			if (allRolesResponse.success) {
				allRoles = allRolesResponse.data;
			}
		} finally {
			loading = false;
		}
	}

	function reset() {
		search = '';
		selectedUserId = '';
		selectedRoleId = '';
	}

	async function handleSubmit() {
		if (!canSubmit) return;
		submitting = true;
		try {
			await onInvite(selectedUserId, selectedRoleId);
			open = false;
			reset();
		} finally {
			submitting = false;
		}
	}

	// ── Mobile detection ──────────────────────────────────────
	let isDesktop = new MediaQuery('(min-width: 768px)');
</script>

<!-- ── Shared content snippet ──────────────────────────────────── -->
{#snippet formContent()}
	<div class="space-y-4">
		<!-- User picker -->
		<div class="space-y-1.5">
			<Label class="text-sm font-medium">Member</Label>

			<!-- Search -->
			<div class="relative">
				<RiSearchLine
					class="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					bind:value={search}
					placeholder="Search by name or email..."
					class="h-9 pl-8 text-sm"
					disabled={loading}
				/>
			</div>

			<!-- User list -->
			<div class="max-h-44 overflow-y-auto rounded-md border border-border">
				{#if loading}
					<div class="flex items-center justify-center py-6 text-xs text-muted-foreground">
						Loading users...
					</div>
				{:else if filteredUsers.length === 0}
					<div class="flex items-center justify-center py-6 text-xs text-muted-foreground">
						No users found
					</div>
				{:else}
					{#each filteredUsers as user}
						{@const isSelected = selectedUserId === user.id}
						<button
							type="button"
							onclick={() => (selectedUserId = isSelected ? '' : user.id)}
							class="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors
                                {isSelected
								? 'bg-primary/10'
								: 'hover:bg-muted/60'} border-b border-border last:border-0"
						>
							<Avatar class="h-7 w-7 shrink-0">
								<AvatarImage src={user.profile_picture} referrerpolicy="no-referrer" />
								<AvatarFallback class="bg-muted text-[10px] font-medium text-muted-foreground">
									{initials(user.full_name)}
								</AvatarFallback>
							</Avatar>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm leading-tight font-medium text-foreground">
									{user.full_name}
								</p>
								<p class="truncate text-xs text-muted-foreground">{user.email}</p>
							</div>
							{#if isSelected}
								<span
									class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary"
								>
									<svg class="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 10 8" fill="none">
										<path
											d="M1 4l2.5 2.5L9 1"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</span>
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Role picker -->
		<div class="space-y-1.5">
			<Label class="text-sm font-medium">Role</Label>
			<Select.Root bind:value={selectedRoleId} type="single" disabled={loading}>
				<Select.Trigger class="h-9 w-full">
					{#if selectedRole}
						<span>{selectedRole.role_name}</span>
					{:else}
						<span class="text-muted-foreground">Select a role...</span>
					{/if}
				</Select.Trigger>
				<Select.Content>
					{#each allRoles as role}
						<Select.Item value={role.id}>{role.role_name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Selected preview -->
		{#if selectedUser}
			<div class="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
				<Avatar class="h-7 w-7 shrink-0">
					<AvatarImage src={selectedUser.profile_picture} referrerpolicy="no-referrer" />
					<AvatarFallback class="bg-muted text-[10px] font-medium text-muted-foreground">
						{initials(selectedUser.full_name)}
					</AvatarFallback>
				</Avatar>
				<div class="min-w-0 flex-1 text-xs">
					<p class="truncate font-medium text-foreground">{selectedUser.full_name}</p>
					<p class="truncate text-muted-foreground">{selectedUser.email}</p>
				</div>
				{#if selectedRole}
					<Badge variant="secondary" class="shrink-0 text-[10px]">{selectedRole.role_name}</Badge>
				{/if}
			</div>
		{/if}
	</div>
{/snippet}

<!-- ── MOBILE → DRAWER ────────────────────────────────────────── -->
{#if !isDesktop.current}
	<Drawer.Root bind:open>
		<Drawer.Trigger>
			{#snippet child({ props })}
				<Button {...props} size="sm" variant="outline" class="gap-1.5">
					<RiUserAddLine class="h-4 w-4" />
					Invite
				</Button>
			{/snippet}
		</Drawer.Trigger>
		<Drawer.Content>
			<div class="mx-auto w-full max-w-sm pb-6">
				<Drawer.Header class="text-left">
					<Drawer.Title class="flex items-center gap-2 text-base font-semibold">
						<span
							class="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
						>
							<RiUserAddLine class="h-4 w-4" />
						</span>
						Invite Member
					</Drawer.Title>
					<Drawer.Description class="text-sm text-muted-foreground">
						Add a new member to the project team.
					</Drawer.Description>
				</Drawer.Header>

				<div class="px-4">
					{@render formContent()}
				</div>

				<Separator class="mt-5" />

				<Drawer.Footer class="flex-row gap-2 pt-4">
					<Drawer.Close>
						{#snippet child({ props })}
							<Button {...props} variant="outline" class="flex-1" onclick={reset}>Cancel</Button>
						{/snippet}
					</Drawer.Close>
					<Button onclick={handleSubmit} disabled={!canSubmit} class="flex-1 gap-1.5">
						<RiUserAddLine class="h-4 w-4" />
						{submitting ? 'Adding...' : 'Add Member'}
					</Button>
				</Drawer.Footer>
			</div>
		</Drawer.Content>
	</Drawer.Root>

	<!-- ── DESKTOP → DIALOG ───────────────────────────────────────── -->
{:else}
	<Dialog.Root bind:open>
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button {...props} size="sm" variant="outline" class="gap-1.5">
					<RiUserAddLine class="h-4 w-4" />
					Invite
				</Button>
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2.5 text-base">
					<span
						class="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
					>
						<RiUserAddLine class="h-4 w-4" />
					</span>
					Invite Member
				</Dialog.Title>
				<Dialog.Description class="text-sm text-muted-foreground">
					Add a new member to the project team.
				</Dialog.Description>
			</Dialog.Header>

			<Separator />

			{@render formContent()}

			<Separator />

			<Dialog.Footer class="gap-2 pt-1 sm:gap-2">
				<Dialog.Close>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm" onclick={reset}>Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button onclick={handleSubmit} disabled={!canSubmit} size="sm" class="gap-1.5">
					<RiUserAddLine class="h-4 w-4" />
					{submitting ? 'Adding...' : 'Add Member'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
