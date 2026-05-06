<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { initials } from '$lib/string_utils';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';

	// ─── Icons (lucide-svelte) ───────────────────────────────────────────────────
	import {
		RiSearchLine,
		RiMore2Line,
		RiEditLine,
		RiDeleteBin7Line,
		RiTeamLine,
		RiShieldCheckLine,
		RiUser3Line
	} from 'remixicon-svelte'; // Atau 'remixicon-svelte' tergantung library yang kamu install
	import type { User } from '$lib/types/user';
	import { currentUserStore } from '$lib/state/currentUser.svelte.js';
	import { formatDate } from '$lib/api_utils.js';
	// ─── Types ───────────────────────────────────────────────────────────────────
	interface UpdateUserData {
		full_name: string;
		email: string;
		phone_number: string;
		global_role: 'ADMIN' | 'USER';
	}

	const { data } = $props();
	// ─── Dummy Data ──────────────────────────────────────────────────────────────
	let users = $derived(data.users.filter((u) => u.id !== currentUserStore.data?.id));

	// ─── State ───────────────────────────────────────────────────────────────────
	let searchQuery = $state('');
	let selectedUser = $state<User | null>(null);
	let editingUser = $state<User | null>(null);
	let deletingUser = $state<User | null>(null);
	let detailOpen = $state(false);
	let editOpen = $state(false);
	let deleteOpen = $state(false);

	let editForm = $state<UpdateUserData>({
		full_name: '',
		email: '',
		phone_number: '',
		global_role: 'USER'
	});

	// ─── Derived ─────────────────────────────────────────────────────────────────
	let filteredUsers = $derived(
		users.filter(
			(u) =>
				u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.email.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function openDetail(user: User) {
		selectedUser = user;
		detailOpen = true;
	}

	function openEdit(user: User, e?: MouseEvent) {
		e?.stopPropagation();
		editingUser = user;
		editForm = {
			full_name: user.full_name,
			email: user.email,
			phone_number: user.phone_number ?? '',
			global_role: user.global_role
		};
		editOpen = true;
	}

	function openDelete(user: User, e?: MouseEvent) {
		e?.stopPropagation();
		deletingUser = user;
		deleteOpen = true;
	}

	function saveEdit() {
		if (!editingUser) return;

		editOpen = false;
		editingUser = null;
	}

	function confirmDelete() {
		if (!deletingUser) return;
		const idToDelete = deletingUser.id;
		users = users.filter((u) => u.id !== idToDelete);
		deleteOpen = false;
		if (selectedUser?.id === idToDelete) detailOpen = false;
		deletingUser = null;
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<!-- Header -->
	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-xl font-semibold tracking-tight text-foreground">User Management</h1>
			<p class="mt-0.5 text-sm text-muted-foreground">Manage your team members and their roles.</p>
		</div>
	</div>

	<!-- Toolbar -->
	<div class="flex items-center justify-between gap-3">
		<div class="relative w-72">
			<RiSearchLine
				class="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				bind:value={searchQuery}
				placeholder="Search name or email..."
				class="bg-card pl-8 text-sm"
			/>
		</div>
		<div class="flex items-center gap-2 text-xs text-muted-foreground">
			<span>{filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}</span>
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-lg border border-border bg-card">
		<Table>
			<TableHeader>
				<TableRow class="border-b border-border hover:bg-transparent">
					<TableHead
						class="w-[280px] pl-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>User</TableHead
					>
					<TableHead class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>Role</TableHead
					>
					<TableHead class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>Phone</TableHead
					>
					<TableHead class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>Provider</TableHead
					>
					<TableHead class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
						>Joined</TableHead
					>
					<TableHead class="w-10 pr-4"></TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{#if filteredUsers.length === 0}
					<TableRow>
						<TableCell colspan={6} class="py-16 text-center">
							<div class="flex flex-col items-center gap-2 text-muted-foreground">
								<RiUser3Line class="size-8 opacity-30" />
								<span class="text-sm">No users found</span>
							</div>
						</TableCell>
					</TableRow>
				{:else}
					{#each filteredUsers as user (user.id)}
						<TableRow
							class="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/30"
							onclick={() => openDetail(user)}
						>
							<TableCell class="py-3 pl-4">
								<div class="flex items-center gap-3">
									<Avatar class="size-8 rounded-md">
										<AvatarImage src={user.profile_picture ?? undefined} alt={user.full_name} />
										<AvatarFallback
											class="rounded-md bg-secondary text-xs font-semibold text-secondary-foreground"
										>
											{initials(user.full_name)}
										</AvatarFallback>
									</Avatar>
									<div class="min-w-0">
										<p
											class="truncate text-sm leading-tight font-medium text-foreground capitalize"
										>
											{user.full_name}
										</p>
										<p class="truncate text-xs text-muted-foreground">{user.email}</p>
									</div>
								</div>
							</TableCell>

							<TableCell class="py-3">
								{#if user.global_role === 'ADMIN'}
									<Badge variant="default" class="text-primary-foreground">
										<RiTeamLine class="size-3" /> Admin
									</Badge>
								{:else}
									<Badge variant="outline" class="gap-1 rounded-md px-2 py-0.5 text-xs font-medium">
										<RiUser3Line class="size-3" /> User
									</Badge>
								{/if}
							</TableCell>

							<TableCell class="py-3 text-sm text-muted-foreground">
								{#if user.phone_number}
									{user.phone_number}
								{:else}
									<span class="text-xs text-muted-foreground/40 italic">—</span>
								{/if}
							</TableCell>

							<TableCell class="py-3">
								<Badge variant="secondary">
									{user.oauth_provider}
								</Badge>
							</TableCell>

							<TableCell class="py-3 text-xs text-muted-foreground">
								{formatDate(user.created_at)}
							</TableCell>

							<TableCell class="py-3 pr-3 text-right">
								<DropdownMenu>
									<DropdownMenuTrigger onclick={(e) => e.stopPropagation()}>
										<Button variant="ghost" size="icon" class="size-7 text-muted-foreground">
											<RiMore2Line class="size-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" class="w-40">
										<DropdownMenuItem onclick={(e) => openEdit(user, e)}>
											<RiEditLine class="mr-2 size-3.5" /> Edit
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											class="text-destructive focus:text-destructive"
											onclick={(e) => openDelete(user, e)}
										>
											<RiDeleteBin7Line class="mr-2 size-3.5" /> Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</div>
	<p class="text-xs text-muted-foreground">
		Click a row to view full details • Use ··· menu to edit or delete
	</p>
</div>

<!-- ─── Dialogs ──────────────────────────────────────────────────────────────── -->

<Dialog bind:open={detailOpen}>
	<DialogContent class="max-w-md">
		{#if selectedUser}
			<DialogHeader>
				<DialogTitle class="text-base">User Detail</DialogTitle>
				<DialogDescription class="text-xs">ID: {selectedUser.id}</DialogDescription>
			</DialogHeader>

			<div class="flex flex-col gap-5 py-2">
				<div class="flex items-center gap-4">
					<Avatar class="size-14 rounded-xl">
						<AvatarImage
							referrerpolicy="no-referrer"
							src={selectedUser.profile_picture ?? undefined}
							alt={selectedUser.full_name}
						/>
						<AvatarFallback
							class="rounded-xl bg-secondary text-lg font-bold text-secondary-foreground"
						>
							{initials(selectedUser.full_name)}
						</AvatarFallback>
					</Avatar>
					<div>
						<p class="font-semibold text-foreground capitalize">{selectedUser.full_name}</p>
						<p class="text-sm text-muted-foreground">{selectedUser.email}</p>
						<div class="mt-1.5 flex items-center gap-1.5">
							{#if selectedUser.global_role === 'ADMIN'}
								<Badge class="border-0 bg-secondary px-1.5 py-0 text-xs text-secondary-foreground">
									<RiShieldCheckLine class="mr-1 size-3" /> Admin
								</Badge>
							{:else}
								<Badge variant="outline" class="px-1.5 py-0 text-xs">
									<RiUser3Line class="mr-1 size-3" /> User
								</Badge>
							{/if}
							<span class="text-xs text-muted-foreground capitalize"
								>{selectedUser.gender ?? '—'}</span
							>
						</div>
					</div>
				</div>
				<Separator />
				<div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Phone</span
						>
						<span class="text-foreground">{selectedUser.phone_number ?? '—'}</span>
					</div>
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Provider</span
						>
						<span class="font-mono text-xs text-foreground">{selectedUser.oauth_provider}</span>
					</div>
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Joined</span
						>
						<span class="text-foreground">{formatDate(selectedUser.created_at)}</span>
					</div>
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
							>Last Updated</span
						>
						<span class="text-foreground">{formatDate(selectedUser.updated_at)}</span>
					</div>
				</div>
			</div>

			<DialogFooter class="gap-2">
				<Button
					variant="destructive"
					size="sm"
					onclick={() => {
						detailOpen = false;
						openDelete(selectedUser!);
					}}
				>
					<RiDeleteBin7Line class="mr-1.5 size-3.5" /> Delete
				</Button>
				<Button
					size="sm"
					onclick={() => {
						detailOpen = false;
						openEdit(selectedUser!);
					}}
				>
					<RiEditLine class="mr-1.5 size-3.5" /> Edit
				</Button>
			</DialogFooter>
		{/if}
	</DialogContent>
</Dialog>

<Dialog bind:open={editOpen}>
	<DialogContent class="max-w-sm">
		<DialogHeader>
			<DialogTitle class="text-base">Edit User</DialogTitle>
			<DialogDescription class="text-xs">Update user information below.</DialogDescription>
		</DialogHeader>

		{#if editingUser}
			<div class="flex flex-col gap-4 py-1">
				<div class="flex flex-col gap-1.5">
					<Label for="edit-name" class="text-xs font-medium">Full Name</Label>
					<Input id="edit-name" bind:value={editForm.full_name} class="h-8 text-sm" />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="edit-email" class="text-xs font-medium">Email</Label>
					<Input id="edit-email" type="email" bind:value={editForm.email} class="h-8 text-sm" />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="edit-phone" class="text-xs font-medium">Phone Number</Label>
					<Input
						id="edit-phone"
						bind:value={editForm.phone_number}
						placeholder="—"
						class="h-8 text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label class="text-xs font-medium">Role</Label>
					<div class="flex gap-2">
						<Button
							variant={editForm.global_role === 'USER' ? 'default' : 'outline'}
							size="sm"
							class="h-8 flex-1 text-xs"
							onclick={() => (editForm.global_role = 'USER')}
						>
							<RiUser3Line class="mr-1.5 size-3" /> User
						</Button>
						<Button
							variant={editForm.global_role === 'ADMIN' ? 'default' : 'outline'}
							size="sm"
							class="h-8 flex-1 text-xs"
							onclick={() => (editForm.global_role = 'ADMIN')}
						>
							<RiShieldCheckLine class="mr-1.5 size-3" /> Admin
						</Button>
					</div>
				</div>
			</div>
		{/if}

		<DialogFooter class="gap-2">
			<Button variant="outline" size="sm" onclick={() => (editOpen = false)}>Cancel</Button>
			<Button size="sm" onclick={saveEdit}>Save changes</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<AlertDialog bind:open={deleteOpen}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete user?</AlertDialogTitle>
			<AlertDialogDescription>
				<span class="font-medium text-foreground capitalize">{deletingUser?.full_name}</span> will be
				permanently removed.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel onclick={() => (deleteOpen = false)}>Cancel</AlertDialogCancel>
			<AlertDialogAction
				class="bg-destructive text-white hover:bg-destructive/90"
				onclick={confirmDelete}
			>
				Delete
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
