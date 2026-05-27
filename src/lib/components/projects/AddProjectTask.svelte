<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import * as Avatar from '$lib/components/ui/avatar';
	import { RiAddLine, RiUserLine, RiWeightLine, RiTaskLine } from 'remixicon-svelte';
	import type { Project, ProjectMember } from '$lib/types/projects';
	import { MediaQuery } from 'svelte/reactivity';

	interface ProjectProgressForm {
		title: string;
		weight: number;
		project_member_id: string;
		is_completed: boolean;
	}

	interface Props {
		addProgressOpen: boolean;
		onAdd: (prg: ProjectProgressForm) => void;
		project: Project;
		isowner?: boolean;
	}

	let { addProgressOpen = $bindable(false), onAdd, project, isowner = false }: Props = $props();

	let progressForm = $state<ProjectProgressForm>({
		title: '',
		weight: 0,
		project_member_id: '',
		is_completed: false
	});

	// Total weight already assigned
	let totalWeight = $derived(project.progress.reduce((sum, p) => sum + p.weight, 0));
	let remainingWeight = $derived(100 - totalWeight);

	let selectedMember = $derived<ProjectMember | undefined>(
		project.project_members.find((m) => m.id === progressForm.project_member_id)
	);

	function handleSubmit() {
		onAdd(progressForm);
		progressForm = { title: '', weight: 0, project_member_id: '', is_completed: false };
	}

	let isDesktop = new MediaQuery('(min-width: 768px)');
</script>

<!-- ─── TRIGGER BUTTON (shared) ─────────────────────────────── -->
{#if !isDesktop}
	<!-- ══════════════════════════════════════════════════════════
         MOBILE → DRAWER
    ══════════════════════════════════════════════════════════ -->
	{#if isowner}
		<Drawer.Root bind:open={addProgressOpen}>
			<Drawer.Trigger>
				{#snippet child({ props })}
					<Button {...props} size="sm" class="gap-1.5">
						<RiAddLine class="h-4 w-4" />
						Add Task
					</Button>
				{/snippet}
			</Drawer.Trigger>

			<Drawer.Content>
				<div class="mx-auto w-full max-w-sm pb-6">
					<Drawer.Header class="text-left">
						<Drawer.Title class="flex items-center gap-2 text-lg font-semibold">
							<span
								class="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
							>
								<RiTaskLine class="h-4 w-4" />
							</span>
							Add New Task
						</Drawer.Title>
						<Drawer.Description class="text-sm text-muted-foreground">
							Fill in the task details and assign a team member.
						</Drawer.Description>
					</Drawer.Header>

					<div class="space-y-5 px-4">
						<!-- Weight indicator -->
						<div class="flex items-center justify-between rounded-lg px-3 py-2 text-xs">
							<span class="text-muted-foreground">Weight used</span>
							<div class="flex items-center gap-1.5">
								<Badge variant="secondary">{totalWeight}% used</Badge>
								<Badge variant="outline">{remainingWeight}% left</Badge>
							</div>
						</div>

						<!-- Title -->
						<div class="space-y-1.5">
							<Label for="drawer-title" class="text-sm font-medium">Task Title</Label>
							<Input
								id="drawer-title"
								bind:value={progressForm.title}
								placeholder="e.g. Design homepage wireframe"
								class="h-10"
							/>
						</div>

						<!-- Weight -->
						<div class="space-y-1.5">
							<div class="flex items-center justify-between">
								<Label for="drawer-weight" class="text-sm font-medium">Weight (%)</Label>
								<span class="text-xs text-muted-foreground">Max {remainingWeight}% remaining</span>
							</div>
							<div class="relative">
								<Input
									id="drawer-weight"
									type="number"
									min="0"
									max={remainingWeight}
									bind:value={progressForm.weight}
									class="h-10 pr-8"
								/>
								<span
									class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground"
									>%</span
								>
							</div>
						</div>

						<!-- Assignee -->
						<div class="space-y-1.5">
							<Label class="text-sm font-medium">Assignee</Label>
							<Select.Root bind:value={progressForm.project_member_id} type="single">
								<Select.Trigger class="h-10 w-full">
									{#if selectedMember}
										<div class="flex items-center gap-2">
											<span class="truncate">{selectedMember.user.full_name}</span>
											<Badge variant="outline" class="ml-auto shrink-0 text-[10px]">
												{selectedMember.role.role_name}
											</Badge>
										</div>
									{:else}
										<span class="flex items-center gap-1.5 text-muted-foreground">
											<RiUserLine class="h-3.5 w-3.5" />
											Assign to...
										</span>
									{/if}
								</Select.Trigger>
								<Select.Content>
									{#each project.project_members as member}
										<Select.Item value={member.id} class="py-2">
											<div class="flex items-center gap-2.5">
												<div
													class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
												>
													{member.user.full_name[0].toUpperCase()}
												</div>
												<div class="min-w-0">
													<p class="truncate text-sm font-medium">{member.user.full_name}</p>
													<p class="truncate text-xs text-muted-foreground">{member.user.email}</p>
												</div>
												<Badge variant="secondary" class="ml-auto shrink-0 text-[10px]">
													{member.role.role_name}
												</Badge>
											</div>
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<Separator class="mt-5" />

					<Drawer.Footer class="flex-row gap-2 pt-4">
						<Drawer.Close>
							{#snippet child({ props })}
								<Button {...props} variant="outline" class="flex-1">Cancel</Button>
							{/snippet}
						</Drawer.Close>
						<Button
							onclick={handleSubmit}
							disabled={!progressForm.title ||
								progressForm.weight <= 0 ||
								!progressForm.project_member_id}
							class="flex-1 gap-1.5"
						>
							<RiAddLine class="h-4 w-4" />
							Save Task
						</Button>
					</Drawer.Footer>
				</div>
			</Drawer.Content>
		</Drawer.Root>
	{/if}
{:else}
	<!-- ══════════════════════════════════════════════════════════
         DESKTOP → DIALOG
    ══════════════════════════════════════════════════════════ -->
	{#if isowner}
		<Dialog.Root bind:open={addProgressOpen}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props} size="sm" class="gap-1.5">
						<RiAddLine class="h-4 w-4" />
						Add Task
					</Button>
				{/snippet}
			</Dialog.Trigger>

			<Dialog.Content class="sm:max-w-md">
				<Dialog.Header>
					<Dialog.Title class="flex items-center gap-2.5 text-base">
						<span
							class="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
						>
							<RiTaskLine class="h-4 w-4" />
						</span>
						Add New Task
					</Dialog.Title>
					<Dialog.Description class="text-sm text-muted-foreground">
						Fill in the task details and assign a team member.
					</Dialog.Description>
				</Dialog.Header>

				<Separator />

				<div class="space-y-4 py-1">
					<!-- Weight indicator -->
					<div class="flex items-center justify-between rounded-lg px-3 py-2 text-xs">
						<span class="text-muted-foreground">Project weight</span>
						<div class="flex items-center gap-1.5">
							<Badge variant="secondary">{totalWeight}% used</Badge>
						</div>
					</div>

					<!-- Title -->
					<div class="space-y-1.5">
						<Label for="dialog-title" class="text-sm font-medium">Task Title</Label>
						<Input
							id="dialog-title"
							bind:value={progressForm.title}
							placeholder="e.g. Design homepage wireframe"
							class="h-9"
						/>
					</div>

					<!-- Weight -->
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<Label for="dialog-weight" class="text-sm font-medium">Weight (%)</Label>
							<span class="text-xs text-muted-foreground">{remainingWeight}% remaining</span>
						</div>
						<div class="relative">
							<Input
								id="dialog-weight"
								type="number"
								min="0"
								max={remainingWeight}
								bind:value={progressForm.weight}
								class="h-9 pr-8"
							/>
							<span
								class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground"
								>%</span
							>
						</div>
					</div>

					<!-- Assignee -->
					<div class="space-y-1.5">
						<Label class="text-sm font-medium">Assignee</Label>
						<Select.Root bind:value={progressForm.project_member_id} type="single">
							<Select.Trigger class="h-9 w-full">
								{#if selectedMember}
									<div class="flex items-center gap-2">
										<Avatar.Root class="h-6 w-6">
											<Avatar.Image
												src={selectedMember.user.profile_picture}
												referrerpolicy="no-referrer"
											></Avatar.Image>
										</Avatar.Root>
										<span class="truncate">{selectedMember.user.full_name}</span>
										<Badge variant="outline" class="ml-auto shrink-0 text-[10px]">
											{selectedMember.role.role_name}
										</Badge>
									</div>
								{:else}
									<span class="flex items-center gap-1.5 text-muted-foreground">
										<RiUserLine class="h-3.5 w-3.5" />
										Assign to...
									</span>
								{/if}
							</Select.Trigger>
							<Select.Content>
								{#each project.project_members as member}
									<Select.Item value={member.id} class="py-2">
										<div class="flex w-full items-center gap-2.5">
											<Avatar.Root class="h-6 w-6">
												<Avatar.Image src={member.user.profile_picture} referrerpolicy="no-referrer"
												></Avatar.Image>
											</Avatar.Root>
											<div class="min-w-0 flex-1">
												<p class="truncate text-sm font-medium">{member.user.full_name}</p>
												<p class="truncate text-xs text-muted-foreground">{member.user.email}</p>
											</div>
											<Badge variant="secondary" class="shrink-0 text-[10px]">
												{member.role.role_name}
											</Badge>
										</div>
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				<Separator />

				<Dialog.Footer class="gap-2 pt-1 sm:gap-2">
					<Dialog.Close>
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="sm">Cancel</Button>
						{/snippet}
					</Dialog.Close>
					<Button
						onclick={handleSubmit}
						size="sm"
						disabled={!progressForm.title ||
							progressForm.weight <= 0 ||
							!progressForm.project_member_id}
						class="gap-1.5"
					>
						<RiAddLine class="h-4 w-4" />
						Save Task
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/if}
{/if}
