<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import {
		RiAddLine,
		RiMoreLine,
		RiEdit2Line,
		RiDeleteBinLine,
		RiShieldLine
	} from 'remixicon-svelte';
	import type { ProjectRole } from '$lib/types/projects';
	import type { ApiResponse } from '$lib/types/api';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { MediaQuery } from 'svelte/reactivity';
	import { parseError } from '$lib/api_utils';

	// ── Mobile detection ──────────────────────────────────────
	let isDesktop = new MediaQuery('(min-width: 768px)');

	// ── Data ──────────────────────────────────────────────────
	let roles = $state<ProjectRole[]>([]);
	let loading = $state(false);

	$effect(() => {
		fetchRoles();
	});

	async function fetchRoles() {
		loading = true;
		try {
			const res = await fetch('/api/project-role/all');
			const json: ApiResponse<ProjectRole[]> = await res.json();
			if (json.success) {
				roles = json.data;
			} else {
				toast.error(
					'error' in json
						? typeof json.error === 'string'
							? json.error
							: 'Failed to load roles'
						: 'Failed to load roles'
				);
			}
		} finally {
			loading = false;
		}
	}

	// ── Add ───────────────────────────────────────────────────
	let addOpen = $state(false);
	let addName = $state('');
	let addSubmitting = $state(false);

	async function handleAdd() {
		if (!addName.trim()) return;
		addSubmitting = true;
		try {
			const res = await fetch('/api/project-role/add', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: addName.trim() })
			});
			const json: ApiResponse<ProjectRole> = await res.json();
			if (json.success) {
				toast.success('Role added');
				addOpen = false;
				addName = '';
				await fetchRoles();
				await invalidateAll();
			} else {
				toast.error(
					'error' in json
						? typeof json.error === 'string'
							? json.error
							: 'Failed to add role'
						: 'Failed to add role'
				);
			}
		} finally {
			addSubmitting = false;
		}
	}

	// ── Edit ──────────────────────────────────────────────────
	let editOpen = $state(false);
	let editTarget = $state<ProjectRole | null>(null);
	let editName = $state('');
	let editSubmitting = $state(false);

	function openEdit(role: ProjectRole) {
		editTarget = role;
		editName = role.role_name;
		editOpen = true;
	}

	async function handleEdit() {
		if (!editTarget || !editName.trim()) return;
		editSubmitting = true;
		try {
			const res = await fetch(`/api/project-role/update/${editTarget.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: editName.trim() })
			});
			const json: ApiResponse<ProjectRole> = await res.json();
			if (json.success) {
				toast.success('Role updated');
				editOpen = false;
				editTarget = null;
				await fetchRoles();
				await invalidateAll();
			} else {
				toast.error(parseError(json.error));
			}
		} finally {
			editSubmitting = false;
		}
	}

	// ── Delete ────────────────────────────────────────────────
	let deleteOpen = $state(false);
	let deleteTarget = $state<ProjectRole | null>(null);
	let deleteSubmitting = $state(false);

	function openDelete(role: ProjectRole) {
		deleteTarget = role;
		deleteOpen = true;
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		deleteSubmitting = true;
		try {
			const res = await fetch(`/api/project-role/delete/${deleteTarget.id}`, {
				method: 'DELETE'
			});
			const json: ApiResponse<null> = await res.json();
			if (json.success) {
				toast.success('Role deleted');
				deleteOpen = false;
				deleteTarget = null;
				await fetchRoles();
				await invalidateAll();
			} else {
				toast.error(
					'error' in json
						? typeof json.error === 'string'
							? json.error
							: 'Failed to delete role'
						: 'Failed to delete role'
				);
			}
		} finally {
			deleteSubmitting = false;
		}
	}
</script>

<!-- ═══════════════════════════════════════════════════════════════
     TAB CONTENT
════════════════════════════════════════════════════════════════ -->
<div class="pt-6">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h2 class="text-lg font-semibold">Project Roles</h2>
			<p class="text-sm text-muted-foreground">
				Manage roles that can be assigned to team members.
			</p>
		</div>

		<!-- Add Role trigger -->
		{#if !isDesktop.current}
			<Drawer.Root bind:open={addOpen}>
				<Drawer.Trigger>
					{#snippet child({ props })}
						<Button {...props} size="sm" class="gap-1.5">
							<RiAddLine class="h-4 w-4" />
							Add Role
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
									<RiShieldLine class="h-4 w-4" />
								</span>
								Add Role
							</Drawer.Title>
							<Drawer.Description class="text-sm text-muted-foreground">
								Create a new role for project members.
							</Drawer.Description>
						</Drawer.Header>
						<div class="space-y-1.5 px-4">
							<Label class="text-sm font-medium">Role Name</Label>
							<Input bind:value={addName} placeholder="e.g. Developer, Designer..." class="h-9" />
						</div>
						<Separator class="mt-5" />
						<Drawer.Footer class="flex-row gap-2 pt-4">
							<Drawer.Close>
								{#snippet child({ props })}
									<Button {...props} variant="outline" class="flex-1">Cancel</Button>
								{/snippet}
							</Drawer.Close>
							<Button
								onclick={handleAdd}
								disabled={!addName.trim() || addSubmitting}
								class="flex-1 gap-1.5"
							>
								<RiAddLine class="h-4 w-4" />
								{addSubmitting ? 'Saving...' : 'Save Role'}
							</Button>
						</Drawer.Footer>
					</div>
				</Drawer.Content>
			</Drawer.Root>
		{:else}
			<Dialog.Root bind:open={addOpen}>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} size="sm" class="gap-1.5">
							<RiAddLine class="h-4 w-4" />
							Add Role
						</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-sm">
					<Dialog.Header>
						<Dialog.Title class="flex items-center gap-2.5 text-base">
							<span
								class="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
							>
								<RiShieldLine class="h-4 w-4" />
							</span>
							Add Role
						</Dialog.Title>
						<Dialog.Description class="text-sm text-muted-foreground">
							Create a new role for project members.
						</Dialog.Description>
					</Dialog.Header>
					<Separator />
					<div class="space-y-1.5 py-1">
						<Label class="text-sm font-medium">Role Name</Label>
						<Input bind:value={addName} placeholder="e.g. Developer, Designer..." class="h-9" />
					</div>
					<Separator />
					<Dialog.Footer class="gap-2 sm:gap-2">
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="outline" size="sm">Cancel</Button>
							{/snippet}
						</Dialog.Close>
						<Button
							onclick={handleAdd}
							disabled={!addName.trim() || addSubmitting}
							size="sm"
							class="gap-1.5"
						>
							<RiAddLine class="h-4 w-4" />
							{addSubmitting ? 'Saving...' : 'Save Role'}
						</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		{/if}
	</div>

	<!-- Role list -->
	{#if loading}
		<div class="flex items-center justify-center py-16 text-sm text-muted-foreground">
			Loading roles...
		</div>
	{:else if roles.length === 0}
		<div class="flex flex-col items-center justify-center gap-2 py-16">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
				<RiShieldLine class="h-5 w-5 text-muted-foreground" />
			</div>
			<p class="text-sm text-muted-foreground">No roles yet. Add one to get started.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
			{#each roles as role}
				<div
					class="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40"
				>
					<div
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
					>
						<RiShieldLine class="h-4 w-4" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-foreground">{role.role_name}</p>
						<p class="text-xs text-muted-foreground">
							Created {new Date(role.created_at).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric'
							})}
						</p>
					</div>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									size="icon"
									class="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<RiMoreLine class="h-4 w-4" />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end" class="w-36">
							<DropdownMenu.Item onclick={() => openEdit(role)} class="gap-2 text-sm">
								<RiEdit2Line class="h-3.5 w-3.5" />
								Edit
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onclick={() => openDelete(role)}
								class="gap-2 text-sm text-destructive focus:text-destructive"
							>
								<RiDeleteBinLine class="h-3.5 w-3.5" />
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- ═══════════════════════════════════════════════════════════════
     EDIT — Dialog / Drawer
════════════════════════════════════════════════════════════════ -->
{#if !isDesktop.current}
	<Drawer.Root bind:open={editOpen}>
		<Drawer.Content>
			<div class="mx-auto w-full max-w-sm pb-6">
				<Drawer.Header class="text-left">
					<Drawer.Title class="flex items-center gap-2 text-base font-semibold">
						<span
							class="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
						>
							<RiEdit2Line class="h-4 w-4" />
						</span>
						Edit Role
					</Drawer.Title>
					<Drawer.Description class="text-sm text-muted-foreground">
						Update the role name.
					</Drawer.Description>
				</Drawer.Header>
				<div class="space-y-1.5 px-4">
					<Label class="text-sm font-medium">Role Name</Label>
					<Input bind:value={editName} placeholder="Role name..." class="h-9" />
				</div>
				<Separator class="mt-5" />
				<Drawer.Footer class="flex-row gap-2 pt-4">
					<Drawer.Close>
						{#snippet child({ props })}
							<Button {...props} variant="outline" class="flex-1">Cancel</Button>
						{/snippet}
					</Drawer.Close>
					<Button
						onclick={handleEdit}
						disabled={!editName.trim() || editSubmitting}
						class="flex-1 gap-1.5"
					>
						{editSubmitting ? 'Saving...' : 'Save Changes'}
					</Button>
				</Drawer.Footer>
			</div>
		</Drawer.Content>
	</Drawer.Root>
{:else}
	<Dialog.Root bind:open={editOpen}>
		<Dialog.Content class="sm:max-w-sm">
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2.5 text-base">
					<span
						class="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
					>
						<RiEdit2Line class="h-4 w-4" />
					</span>
					Edit Role
				</Dialog.Title>
				<Dialog.Description class="text-sm text-muted-foreground">
					Update the role name.
				</Dialog.Description>
			</Dialog.Header>
			<Separator />
			<div class="space-y-1.5 py-1">
				<Label class="text-sm font-medium">Role Name</Label>
				<Input bind:value={editName} placeholder="Role name..." class="h-9" />
			</div>
			<Separator />
			<Dialog.Footer class="gap-2 sm:gap-2">
				<Dialog.Close>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm">Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button
					onclick={handleEdit}
					disabled={!editName.trim() || editSubmitting}
					size="sm"
					class="gap-1.5"
				>
					{editSubmitting ? 'Saving...' : 'Save Changes'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}

<!-- ═══════════════════════════════════════════════════════════════
     DELETE — AlertDialog (sama di mobile & desktop)
════════════════════════════════════════════════════════════════ -->
<AlertDialog.Root bind:open={deleteOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Role</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete <span class="font-medium text-foreground"
					>"{deleteTarget?.role_name}"</span
				>? Members currently assigned this role will be affected.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => (deleteTarget = null)}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={handleDelete}
				disabled={deleteSubmitting}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
			>
				{deleteSubmitting ? 'Deleting...' : 'Delete'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
