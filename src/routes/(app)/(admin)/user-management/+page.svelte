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
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import {
		RiSearchLine,
		RiMore2Line,
		RiEditLine,
		RiDeleteBin7Line,
		RiTeamLine,
		RiShieldCheckLine,
		RiUser3Line,
		RiMenLine,
		RiWomenLine,
		RiErrorWarningLine
	} from 'remixicon-svelte';

	import type { User } from '$lib/types/user';
	import type { ApiResponse } from '$lib/types/api.js';
	import { formatDate, parseError } from '$lib/api_utils.js';
	import { toast, Toaster } from 'svelte-sonner';
	import { themeData } from '$lib/state/theme.svelte.js';

	// TAMBAHAN: Import invalidateAll dari SvelteKit
	import { invalidateAll } from '$app/navigation';

	// ─── Types ───────────────────────────────────────────────────────────────────

	interface UpdateUserData {
		gender: 'male' | 'female' | string;
		full_name: string;
		phone_number: string | null;
		global_role: 'ADMIN' | 'USER';
	}

	// ─── Props ───────────────────────────────────────────────────────────────────

	const { data } = $props();

	// ─── Dialog State ─────────────────────────────────────────────────────────────

	let detailOpen = $state(false);
	let editOpen = $state(false);
	let deleteOpen = $state(false);

	let selectedUser = $state<User | null>(null);
	let targetUser = $state<User | null>(null);

	let editForm = $state<UpdateUserData>({
		gender: 'male',
		full_name: '',
		phone_number: null,
		global_role: 'USER'
	});

	// ─── Search ──────────────────────────────────────────────────────────────────

	let searchQuery = $state('');

	function getFilteredUsers(users: User[]) {
		if (!searchQuery.trim()) return users;
		const q = searchQuery.toLowerCase();
		return users.filter(
			(u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
		);
	}

	// ─── Handlers ────────────────────────────────────────────────────────────────

	function openDetail(user: User) {
		selectedUser = user;
		detailOpen = true;
	}

	function openEdit(user: User, e?: MouseEvent) {
		e?.stopPropagation();
		targetUser = user;
		editForm = {
			full_name: user.full_name,
			gender: user.gender,
			phone_number: user.phone_number,
			global_role: user.global_role
		};
		editOpen = true;
	}

	function openDelete(user: User, e?: MouseEvent) {
		e?.stopPropagation();
		targetUser = user;
		deleteOpen = true;
	}

	// ─── API Calls ───────────────────────────────────────────────────────────────

	async function patchRole(userId: string, role: 'ADMIN' | 'USER'): Promise<boolean> {
		const res = await fetch(`/api/user/update-role/${userId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role })
		});
		const json: ApiResponse<string> = await res.json();
		if (!json.success) {
			toast.error(parseError(json.error), { duration: 1500 });
			return false;
		}
		return true;
	}

	async function patchProfile(
		userId: string,
		payload: Omit<UpdateUserData, 'global_role'>
	): Promise<boolean> {
		const res = await fetch(`/api/user/update/${userId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const json: ApiResponse<string> = await res.json();
		if (!json.success) {
			toast.error(parseError(json.error), { duration: 1500 });
			return false;
		}
		return true;
	}

	async function deleteUser(userId: string): Promise<boolean> {
		const res = await fetch(`/api/user/delete/${userId}`, {
			method: 'DELETE'
		});
		const json: ApiResponse<string> = await res.json();
		if (!json.success) {
			toast.error(parseError(json.error), { duration: 1500 });
			return false;
		}
		return true;
	}

	// ─── Actions ─────────────────────────────────────────────────────────────────

	async function saveEdit() {
		if (!targetUser) return;

		editOpen = false;

		const savePromise = (async () => {
			const roleChanged = editForm.global_role !== targetUser.global_role;

			const profileChanged =
				editForm.full_name !== targetUser.full_name ||
				editForm.gender !== targetUser.gender ||
				editForm.phone_number !== targetUser.phone_number;

			const tasks: Promise<boolean>[] = [];

			if (roleChanged) {
				tasks.push(patchRole(targetUser.id, editForm.global_role));
			}

			if (profileChanged) {
				tasks.push(
					patchProfile(targetUser.id, {
						full_name: editForm.full_name,
						phone_number: editForm.phone_number === '' ? null : editForm.phone_number,
						gender: editForm.gender
					})
				);
			}

			const results = await Promise.all(tasks);

			if (results.some((ok) => !ok)) {
				throw new Error('Failed to update user');
			}

			await invalidateAll();

			return {
				message: 'User updated'
			};
		})();

		toast.promise(savePromise, {
			loading: 'Updating user...',
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) {
					return err.message;
				}

				return 'Internal server error';
			},
			duration: 1500
		});

		savePromise.finally(() => {
			targetUser = null;
		});
	}

	async function confirmDelete() {
		if (!targetUser) return;

		try {
			const ok = await deleteUser(targetUser.id);
			if (!ok) return;

			if (selectedUser?.id === targetUser.id) detailOpen = false;

			toast.success('User deleted', { duration: 1500 });
			deleteOpen = false;
			targetUser = null;

			// CUKUP PANGGIL INI, DATA AKAN REFRESH OTOMATIS
			await invalidateAll();
		} catch {
			toast.error('Internal server error', { duration: 1500 });
		}
	}
</script>

<div class="flex animate-in flex-col gap-6 p-6 duration-500 fade-in">
	<Toaster richColors theme={themeData.value} position="top-right" />

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

		<div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
			<!-- MENGGUNAKAN AWAIT UNTUK JUMLAH RESULT -->
			{#await data.usersPromise}
				<Skeleton class="h-4 w-16" />
			{:then res}
				{#if !res.error}
					{@const count = getFilteredUsers(res.users).length}
					<span>{count} result{count !== 1 ? 's' : ''}</span>
				{/if}
			{/await}
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
				<!-- PENDEKATAN SVELTEKIT SEJATI: MENGGUNAKAN {#await} -->
				{#await data.usersPromise}
					<!-- Loading Skeletons -->
					{#each Array(5) as _}
						<TableRow class="border-b border-border/60 hover:bg-transparent">
							<TableCell class="py-3 pl-4">
								<div class="flex items-center gap-3">
									<Skeleton class="size-8 rounded-md" />
									<div class="flex flex-col gap-1.5">
										<Skeleton class="h-3.5 w-32" />
										<Skeleton class="h-3 w-24" />
									</div>
								</div>
							</TableCell>
							<TableCell class="py-3"><Skeleton class="h-5 w-16 rounded-full" /></TableCell>
							<TableCell class="py-3"><Skeleton class="h-4 w-28" /></TableCell>
							<TableCell class="py-3"><Skeleton class="h-5 w-20 rounded-full" /></TableCell>
							<TableCell class="py-3"><Skeleton class="h-4 w-24" /></TableCell>
							<TableCell class="py-3 pr-3 text-right"
								><Skeleton class="ml-auto size-7 rounded-md" /></TableCell
							>
						</TableRow>
					{/each}
				{:then res}
					{#if res.error}
						<!-- Error State -->
						<TableRow class="hover:bg-transparent">
							<TableCell colspan={6} class="py-16 text-center">
								<div class="flex flex-col items-center gap-2 text-destructive">
									<RiErrorWarningLine class="size-8 opacity-80" />
									<span class="text-sm font-medium">Failed to load users</span>
									<span class="text-xs opacity-80">{parseError(res.error)}</span>
								</div>
							</TableCell>
						</TableRow>
					{:else}
						<!-- Bikin variable konstan lokal untuk tabel yg sudah di filter -->
						{@const filteredUsers = getFilteredUsers(res.users)}

						{#if filteredUsers.length === 0}
							<!-- Empty State -->
							<TableRow class="hover:bg-transparent">
								<TableCell colspan={6} class="py-16 text-center">
									<div class="flex flex-col items-center gap-2 text-muted-foreground">
										<RiUser3Line class="size-8 opacity-30" />
										<span class="text-sm">No users found</span>
									</div>
								</TableCell>
							</TableRow>
						{:else}
							<!-- Actual Data -->
							{#each filteredUsers as user (user.id)}
								<TableRow
									class="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/30"
									onclick={() => openDetail(user)}
								>
									<TableCell class="py-3 pl-4">
										<div class="flex items-center gap-3">
											<Avatar class="size-8 rounded-md">
												<AvatarImage
													src={user.profile_picture ?? undefined}
													alt={user.full_name}
													referrerpolicy="no-referrer"
												/>
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
												<RiTeamLine class="mr-1 size-3" /> Admin
											</Badge>
										{:else}
											<Badge
												variant="outline"
												class="gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
											>
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
					{/if}
				{:catch}
					<!-- Fallback Error jika koneksi putus -->
					<TableRow class="hover:bg-transparent">
						<TableCell colspan={6} class="py-16 text-center text-destructive">
							Failed to connect to server.
						</TableCell>
					</TableRow>
				{/await}
			</TableBody>
		</Table>
	</div>
	<p class="mt-4 text-xs text-muted-foreground">
		Click a row to view full details • Use ··· menu to edit or delete
	</p>
</div>

<!-- (Bagian komponen <Dialog> & <AlertDialog> tetap persis sama dan tidak ada perubahan) -->

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

		{#if targetUser}
			<div class="flex flex-col gap-4 py-1">
				<div class="flex flex-col gap-1.5">
					<Label for="edit-name" class="text-xs font-medium">Full Name</Label>
					<Input id="edit-name" bind:value={editForm.full_name} class="h-8 text-sm" />
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
					<Label class="text-xs font-medium">Gender</Label>

					<div class="flex gap-2">
						<Button
							variant={editForm.gender === 'male' ? 'default' : 'outline'}
							size="sm"
							class="h-8 flex-1 text-xs"
							onclick={() => (editForm.gender = 'male')}
						>
							<RiMenLine class="mr-1.5 size-3 text-secondary" />
							Male
						</Button>

						<Button
							variant={editForm.gender === 'female' ? 'default' : 'outline'}
							size="sm"
							class="h-8 flex-1 text-xs"
							onclick={() => (editForm.gender = 'female')}
						>
							<RiWomenLine class="mr-1.5 size-3 text-pink-300" />
							Female
						</Button>
					</div>
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
				<span class="font-medium text-foreground capitalize">{targetUser?.full_name}</span> will be permanently
				removed.
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
