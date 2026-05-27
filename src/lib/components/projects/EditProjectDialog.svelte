<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import {
		RiCheckLine,
		RiEdit2Line,
		RiTimeLine,
		RiSearchEyeLine,
		RiCheckboxCircleLine,
		RiArchiveLine
	} from 'remixicon-svelte';

	import * as Drawer from '$lib/components/ui/drawer';

	import Button from '../ui/button/button.svelte';
	import Input from '../ui/input/input.svelte';
	import Label from '../ui/label/label.svelte';
	import Separator from '../ui/separator/separator.svelte';
	import Textarea from '../ui/textarea/textarea.svelte';

	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '../ui/dialog';

	import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';

	// Definisikan tipe untuk projectForm agar lebih type-safe
	interface ProjectFormType {
		name: string;
		description: string;
		status: string;
		allowed_revision: number;
		end_date: string;
	}

	// Tangkap props dari parent menggunakan Svelte 5 $props() rune
	let {
		projectForm = $bindable(),
		editProjectOpen = $bindable(),
		saveProject
	}: {
		projectForm: ProjectFormType;
		editProjectOpen: boolean;
		saveProject: () => void;
	} = $props();

	// Config status
	const projectStatusConfig: Record<string, { label: string; class: string }> = {
		in_progress: { label: 'In Progress', class: 'text-blue-600' },
		in_review: { label: 'In Review', class: 'text-amber-600' },
		completed: { label: 'Completed', class: 'text-emerald-600' },
		archive: { label: 'Archive', class: 'text-muted-foreground' }
	};

	// Deteksi Mobile vs Desktop
	let isMobile = new MediaQuery('(max-width: 640px)');
</script>

{#snippet statusIcon(status: string)}
	{#if status === 'in_progress'}
		<RiTimeLine class="h-4 w-4 text-blue-500" />
	{:else if status === 'in_review'}
		<RiSearchEyeLine class="h-4 w-4 text-amber-500" />
	{:else if status === 'completed'}
		<RiCheckboxCircleLine class="h-4 w-4 text-emerald-500" />
	{:else if status === 'archive'}
		<RiArchiveLine class="h-4 w-4 text-muted-foreground" />
	{:else}
		<div class="h-4 w-4"></div>
	{/if}
{/snippet}

{#snippet editProjectForm()}
	<div class="space-y-5">
		<div class="space-y-1.5">
			<Label class="text-sm font-medium">Project Name</Label>
			<Input bind:value={projectForm.name} placeholder="Project name..." class="h-9" />
		</div>

		<div class="space-y-1.5">
			<Label class="text-sm font-medium">Description</Label>
			<Textarea
				bind:value={projectForm.description}
				rows={3}
				placeholder="Describe the project..."
				class="resize-none text-sm"
			/>
		</div>

		<div class="space-y-1.5">
			<Label class="text-sm font-medium">Status</Label>
			<Select bind:value={projectForm.status} type="single">
				<SelectTrigger class="h-9 w-full">
					{#if projectForm.status}
						<div class="flex items-center gap-2">
							{@render statusIcon(projectForm.status)}
							{projectStatusConfig[projectForm.status]?.label ?? projectForm.status}
						</div>
					{:else}
						<span class="text-muted-foreground">Select status...</span>
					{/if}
				</SelectTrigger>
				<SelectContent>
					{#each Object.entries(projectStatusConfig) as [value, cfg]}
						<SelectItem {value} class="text-sm">
							<div class="flex items-center gap-2">
								{@render statusIcon(value)}
								{cfg.label}
							</div>
						</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>

		<div class="space-y-1.5">
			<div class="flex items-center justify-between">
				<Label class="text-sm font-medium">Allowed Revisions</Label>
				<span class="text-xs text-muted-foreground">1 – 100</span>
			</div>
			<div class="relative">
				<Input
					type="number"
					min="1"
					max="100"
					bind:value={projectForm.allowed_revision}
					class="h-9 pr-16"
				/>
				<span
					class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground"
				>
					revision{projectForm.allowed_revision === 1 ? '' : 's'}
				</span>
			</div>
		</div>

		<div class="space-y-1.5">
			<Label class="text-sm font-medium">End Date</Label>
			<Input type="date" bind:value={projectForm.end_date} class="h-9" />
		</div>
	</div>
{/snippet}

{#if isMobile.current}
	<Drawer.Root bind:open={editProjectOpen}>
		<Drawer.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline" size="sm" class="gap-1.5">
					<RiEdit2Line class="h-4 w-4" />
					Edit Project
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
							<RiEdit2Line class="h-4 w-4" />
						</span>
						Edit Project
					</Drawer.Title>
					<Drawer.Description class="text-sm text-muted-foreground">
						Update project details and settings.
					</Drawer.Description>
				</Drawer.Header>

				<div class="max-h-[60vh] overflow-y-auto px-4 py-2">
					{@render editProjectForm()}
				</div>

				<Separator class="mt-4" />

				<Drawer.Footer class="flex-row gap-2 pt-4">
					<Drawer.Close>
						{#snippet child({ props })}
							<Button {...props} variant="outline" class="flex-1">Cancel</Button>
						{/snippet}
					</Drawer.Close>
					<Button onclick={saveProject} class="flex-1 gap-1.5">
						<RiCheckLine class="h-4 w-4" />
						Save Changes
					</Button>
				</Drawer.Footer>
			</div>
		</Drawer.Content>
	</Drawer.Root>
{:else}
	<Dialog bind:open={editProjectOpen}>
		<DialogTrigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline" size="sm" class="gap-1.5">
					<RiEdit2Line class="h-4 w-4" />
					Edit Project
				</Button>
			{/snippet}
		</DialogTrigger>
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle class="flex items-center gap-2.5 text-base">
					<span
						class="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
					>
						<RiEdit2Line class="h-4 w-4" />
					</span>
					Edit Project
				</DialogTitle>
				<DialogDescription class="text-sm text-muted-foreground">
					Update project details and settings.
				</DialogDescription>
			</DialogHeader>

			<Separator />

			<div class="max-h-[50vh] overflow-y-auto px-1 py-2">
				{@render editProjectForm()}
			</div>

			<Separator />

			<DialogFooter class="gap-2 sm:gap-2">
				<Button variant="outline" size="sm" onclick={() => (editProjectOpen = false)}>
					Cancel
				</Button>
				<Button size="sm" onclick={saveProject} class="gap-1.5">
					<RiCheckLine class="h-4 w-4" />
					Save Changes
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
{/if}
