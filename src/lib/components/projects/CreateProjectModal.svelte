<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Select from '$lib/components/ui/select';

	import { RiLoader4Line, RiAddLine, RiCalendarLine } from 'remixicon-svelte';
	import type { ProjectRole } from '$lib/types/projects';
	import type { OrderListDTO } from '$lib/types/order';
	import { MediaQuery } from 'svelte/reactivity';
	import { currentUserStore } from '$lib/state/currentUser.svelte';
	import { toast, Toaster } from 'svelte-sonner';
	import { themeData } from '$lib/state/theme.svelte';
	import { invalidateAll } from '$app/navigation';

	let {
		open = $bindable(false),
		orders = [],
		projectRoles = [],
		onSuccess
	} = $props<{
		open: boolean;
		orders: OrderListDTO[];
		projectRoles: ProjectRole[];
		onSuccess?: () => void;
	}>();

	// Responsive Desktop/Mobile detection
	let isDesktop = new MediaQuery('(min-width: 768px)');

	let isSubmitting = $state(false);
	let formError = $state('');

	let form = $state({
		order_id: '',
		name: '',
		description: '',
		status: 'in_progress',
		allowed_revision_count: 3,
		end_date: '',
		creator_role_id: ''
	});

	function resetForm() {
		form = {
			order_id: '',
			name: '',
			description: '',
			status: 'in_progress',
			allowed_revision_count: 3,
			end_date: '',
			creator_role_id: ''
		};
		formError = '';
	}

	function handleSubmit() {
		if (!form.order_id || !form.name || !form.status) {
			toast.error('Please fill in all required fields.');
			return;
		}

		const payload: Record<string, unknown> = {
			order_id: form.order_id,
			name: form.name,
			status: form.status,
			creator_role_id: form.creator_role_id
		};

		if (form.description) payload.description = form.description;
		if (form.allowed_revision_count)
			payload.allowed_revision_count = Number(form.allowed_revision_count);
		if (form.end_date) payload.end_date = new Date(form.end_date).toISOString();

		// Langsung tutup modal saat submit di-klik
		open = false;

		const createProjectProm = fetch('/api/projects/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		}).then(async (res) => {
			const apiResponse = await res.json();

			if (!apiResponse.success) {
				// Kalau gagal, buka lagi modalnya supaya user tidak perlu ngetik ulang
				open = true;
				// Asumsi kamu punya fungsi parseError, atau langsung tembak string errornya
				throw new Error(apiResponse.error || 'Failed to create project');
			}

			await invalidateAll();
			resetForm();
			if (onSuccess) onSuccess();

			return apiResponse;
		});

		toast.promise(createProjectProm, {
			loading: 'Creating new project...',
			success: (result) => result.message || 'Project created successfully!',
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});
	}
</script>

{#snippet projectForm()}
	<div class="space-y-4 px-4 py-2 sm:px-0">
		<div class="space-y-1.5">
			<Label>Order / Client <span class="text-destructive">*</span></Label>
			<Select.Root type="single" bind:value={form.order_id}>
				<Select.Trigger class="w-full">
					{#if form.order_id}
						{@const selectedOrder = orders.find((o: OrderListDTO) => o.id === form.order_id)}
						{selectedOrder?.product.name} — {selectedOrder?.user?.full_name}
						({selectedOrder?.id.split('-')[0].toUpperCase()})
					{:else}
						Select an order to attach...
					{/if}
				</Select.Trigger>

				<Select.Content>
					{#each orders as order}
						<Select.Item
							value={order.id}
							label={`${order.product.name} - ${order.user?.full_name} (${order.id.split('-')[0].toUpperCase()})`}
						>
							<div class="flex flex-col items-start gap-1 py-0.5">
								<span class="font-medium text-foreground">
									{order.product.name} — {order.user?.full_name}
								</span>

								<div class="flex items-center gap-1.5 text-[11px] text-muted-foreground">
									<span class="rounded bg-muted px-1 py-0.5 font-mono">
										ID: {order.id.split('-')[0].toUpperCase()}
									</span>
								</div>
							</div>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="space-y-1.5">
			<Label for="name">Project Name <span class="text-destructive">*</span></Label>
			<Input id="name" bind:value={form.name} placeholder="e.g. Website Redesign" maxlength={255} />
		</div>

		<div class="space-y-1.5">
			<Label for="description">Description</Label>
			<Textarea
				id="description"
				bind:value={form.description}
				placeholder="Brief description of the project scope and goals..."
				rows={3}
				class="resize-none"
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-1.5">
				<Label for="revisions">Allowed Revisions</Label>
				<Input
					id="revisions"
					type="number"
					bind:value={form.allowed_revision_count}
					min={3}
					max={100}
					placeholder="3–100"
				/>
			</div>

			<div class="space-y-1.5">
				<Label for="end_date">Deadline</Label>
				<div class="relative">
					<RiCalendarLine
						class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input id="end_date" type="date" bind:value={form.end_date} class="pl-9" />
				</div>
			</div>
		</div>

		<div class="space-y-1.5">
			<Label>Project Role <span class="text-destructive">*</span></Label>
			<Select.Root type="single" bind:value={form.creator_role_id}>
				<Select.Trigger class="w-full">
					{#if form.creator_role_id}
						{@const selectedRole = projectRoles.find(
							(r: ProjectRole) => r.id === form.creator_role_id
						)}
						{selectedRole?.role_name}
					{:else}
						Select a role for you in this project...
					{/if}
				</Select.Trigger>

				<Select.Content>
					{#each projectRoles as role}
						<Select.Item value={role.id} label={role.role_name}>
							<div class="flex flex-col items-start gap-1 py-0.5">
								<span class="font-medium text-foreground">
									{role.role_name}
								</span>

								<div class="flex items-center gap-1.5 text-[11px] text-muted-foreground">
									<span class="rounded bg-muted px-1 py-0.5 font-mono">
										ID: {role.id.split('-')[0].toUpperCase()}
									</span>
								</div>
							</div>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		{#if formError}
			<p in:fly={{ y: -4, duration: 150 }} class="mt-2 text-sm font-medium text-destructive">
				{formError}
			</p>
		{/if}
	</div>
{/snippet}

{#if isDesktop.current}
	<Dialog.Root
		bind:open
		onOpenChange={(v) => {
			if (!v) resetForm();
		}}
	>
		<Dialog.Content class="max-w-lg">
			<Dialog.Header>
				<Dialog.Title>Create New Project</Dialog.Title>
				<Dialog.Description>Fill in the details below to create a new project.</Dialog.Description>
			</Dialog.Header>

			{@render projectForm()}

			<Dialog.Footer class="gap-2">
				<Button variant="outline" onclick={() => (open = false)} disabled={isSubmitting}
					>Cancel</Button
				>
				<Button onclick={handleSubmit} disabled={isSubmitting} class="min-w-[120px] gap-2">
					{#if isSubmitting}
						<RiLoader4Line class="h-4 w-4 animate-spin" /> Creating...
					{:else}
						<RiAddLine class="h-4 w-4" /> Create Project
					{/if}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root
		bind:open
		onOpenChange={(v) => {
			if (!v) resetForm();
		}}
	>
		<Drawer.Content>
			<Drawer.Header class="text-left">
				<Drawer.Title>Create New Project</Drawer.Title>
				<Drawer.Description>Fill in the details below to create a new project.</Drawer.Description>
			</Drawer.Header>

			<div class="max-h-[70vh] overflow-y-auto">
				{@render projectForm()}
			</div>

			<Drawer.Footer class="pt-2">
				<Button onclick={handleSubmit} disabled={isSubmitting} class="w-full gap-2">
					{#if isSubmitting}
						<RiLoader4Line class="h-4 w-4 animate-spin" /> Creating...
					{:else}
						<RiAddLine class="h-4 w-4" /> Create Project
					{/if}
				</Button>
				<Drawer.Close class="w-full">
					{#snippet child({ props })}
						<Button {...props} variant="outline" class="w-full" disabled={isSubmitting}
							>Cancel</Button
						>
					{/snippet}
				</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if}
<Toaster richColors theme={themeData.value} position="top-right" />
