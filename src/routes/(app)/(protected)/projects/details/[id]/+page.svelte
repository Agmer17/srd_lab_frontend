<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from '$lib/components/ui/alert-dialog';
	// Remix Icons Svelte (Prefix Ri)
	import {
		RiTimeLine,
		RiCheckLine,
		RiEdit2Line,
		RiDeleteBinLine,
		RiRefreshLine,
		RiCalendarEventLine,
		RiPulseLine,
		RiChatQuoteLine,
		RiBarChartBoxLine,
		RiTeamLine,
		RiMore2Fill,
		RiShieldUserLine,
		RiShieldLine,
		RiArrowLeftLine,
		RiPencilLine,
		RiCloseLine,
		RiMoreLine
	} from 'remixicon-svelte';
	import type {
		Project,
		ProjectMember,
		ProjectProgress,
		ProjectRevision
	} from '$lib/types/projects';
	import { formatCurrency, formatDate, parseError } from '$lib/api_utils';
	import { initials } from '$lib/string_utils';
	import { currentUserStore } from '$lib/state/currentUser.svelte.js';
	import AddProjectTask from '$lib/components/projects/AddProjectTask.svelte';
	import { Toaster } from 'svelte-sonner';
	import { toast } from 'svelte-sonner';
	import { themeData } from '$lib/state/theme.svelte.js';
	import type { ApiResponse } from '$lib/types/api.js';
	import { invalidateAll } from '$app/navigation';
	import AddNewMemberDialog from '$lib/components/projects/AddNewMemberDialog.svelte';
	import ProjectRolesTab from '$lib/components/projects/ProjectRolesTab.svelte';
	import EditProjectDialog from '$lib/components/projects/EditProjectDialog.svelte';

	let { data } = $props();

	const project = $derived<Project | null>(data.projectDetails);

	interface UpdateProjectRequest {
		name?: string;
		description?: string;
		status?: string;
		allowed_revision?: number;
		end_date?: string;
	}

	// ─── Computed ─────────────────────────────────────────────────────────────────
	const completedWeight = $derived(
		project?.progress?.filter((p) => p.is_completed).reduce((sum, p) => sum + p.weight, 0) ?? 0
	);
	const totalWeight = $derived(project?.progress?.reduce((sum, p) => sum + p.weight, 0) ?? 0);
	const progressPercent = $derived(
		totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0
	);
	const usedRevisions = $derived(project?.project_revision?.length ?? 0);
	const remainingRevisions = $derived((project?.allowed_revision_count ?? 0) - usedRevisions);

	// ─── Dialog States ────────────────────────────────────────────────────────────
	let editProjectOpen = $state(false);
	let addMemberOpen = $state(false);
	let addProgressOpen = $state(false);
	let addRevisionOpen = $state(false);

	// ─── Form States ──────────────────────────────────────────────────────────────
	let projectForm = $state({
		name: project?.name || '',
		description: project?.description || '',
		status: project?.status || '',
		allowed_revision: project?.allowed_revision_count || 0,
		end_date: project?.end_date || ''
	});
	let revisionForm = $state({ title: '', reason: '' });

	const statusConfig: Record<string, { label: string; class: string }> = {
		pending: {
			label: 'Pending',
			class: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
		},

		accepted: {
			label: 'Accepted',
			class: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
		},

		rejected: {
			label: 'Rejected',
			class: 'bg-destructive/10 text-destructive hover:bg-destructive/20'
		}
	};

	const projectStatusConfig: Record<string, { label: string; class: string }> = {
		in_progress: { label: 'In Progress', class: 'text-blue-600' },
		in_review: { label: 'In Review', class: 'text-amber-600' },
		completed: { label: 'Completed', class: 'text-emerald-600' },
		archive: { label: 'Archive', class: 'text-muted-foreground' }
	};

	function getStatus(key: string) {
		return statusConfig[key] ?? statusConfig['pending'];
	}

	function getRole(member: ProjectMember) {
		if (member.is_owner) {
			return 'OWNER';
		} else if (member.id === project?.order?.user_id) {
			return 'CLIENT';
		} else {
			return 'MEMBER';
		}
	}

	// ─── Handlers ─────────────────────────────────────────────────────────────────
	function saveProject() {
		if (!project) return;

		// Siapkan objek kosong untuk nampung data yang berubah
		const payload: UpdateProjectRequest = {};

		// Bandingin field satu per satu
		if (projectForm.name !== project.name) {
			payload.name = projectForm.name;
		}

		if (projectForm.description !== project.description) {
			payload.description = projectForm.description;
		}

		if (projectForm.status !== project.status) {
			payload.status = projectForm.status;
		}

		// Perhatikan nama field aslinya 'allowed_revision_count'
		if (projectForm.allowed_revision !== project.allowed_revision_count) {
			payload.allowed_revision = projectForm.allowed_revision;
		}

		// Pastikan format date dari form sesuai dengan ekspektasi backend (biasanya YYYY-MM-DD / RFC3339)
		if (projectForm.end_date !== project.end_date) {
			payload.end_date = projectForm.end_date;
		}

		// Cek apakah ada data yang berubah
		if (Object.keys(payload).length === 0) {
			console.log('Nggak ada data yang diubah!');
			editProjectOpen = false;
			return;
		}

		console.log('Payload untuk API:', payload);

		const updateProm = fetch('/api/projects/update/' + project.id, {
			method: 'PATCH',
			body: JSON.stringify(payload)
		}).then(async (res) => {
			const apiResponse: ApiResponse<Project> = await res.json();
			if (!apiResponse.success) {
				throw new Error(parseError(apiResponse.error));
			}

			await invalidateAll();
			return apiResponse;
		});

		toast.promise(updateProm, {
			loading: 'trying to update the project data',
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});
		editProjectOpen = false;
	}

	function toggleProgress(progress: ProjectProgress) {
		if (!project) return;

		const updatedData = {
			title: progress.title,
			weight: progress.weight,
			is_completed: !(progress.is_completed ?? false),
			project_member_id: progress.member.id
		};

		const toggleProm = fetch('/api/projects/' + project.id + '/progress/update/' + progress.id, {
			method: 'PATCH',
			body: JSON.stringify(updatedData)
		}).then(async (res) => {
			const apiResponse: ApiResponse<ProjectProgress> = await res.json();
			if (!apiResponse.success) {
				throw new Error(parseError(apiResponse.error));
			}

			await invalidateAll();
			return apiResponse;
		});

		toast.promise(toggleProm, {
			loading: 'trying to update the progress state',
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});
	}
	function addProgress(data: {
		title: string;
		weight: number;
		project_member_id: string;
		is_completed: boolean;
	}) {
		if (!project || !data) return;

		const prom = fetch('/api/projects/' + project.id + '/progress', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(async (res) => {
			const apiResponse: ApiResponse<ProjectProgress> = await res.json();
			if (!apiResponse.success) {
				throw new Error(parseError(apiResponse.error));
			}

			await invalidateAll();
			return apiResponse;
		});
		addProgressOpen = false;

		toast.promise(prom, {
			loading: 'trying to add new progress..',
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});
	}

	function deleteProgress(id: string) {
		if (!project) return;

		const delProm = fetch('/api/projects/' + project.id + '/progress/delete/' + id, {
			method: 'DELETE'
		}).then(async (res) => {
			const apiResponse: ApiResponse<string> = await res.json();
			if (!apiResponse.success) {
				throw new Error(parseError(apiResponse.error));
			}

			await invalidateAll();
			return apiResponse;
		});

		toast.promise(delProm, {
			loading: 'trying to delete progress...',
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});
	}

	function updateRevisionStatus(
		revisionId: string,
		newStatus: 'pending' | 'accepted' | 'rejected'
	) {
		if (!project) return;

		// Menyesuaikan dengan pattern path API SvelteKit kamu
		const updateRevProm = fetch('/api/projects/' + project.id + '/revision/update/' + revisionId, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ status: newStatus })
		}).then(async (res) => {
			const apiResponse: ApiResponse<ProjectRevision> = await res.json();
			if (!apiResponse.success) {
				throw new Error(parseError(apiResponse.error));
			}

			await invalidateAll();
			return apiResponse;
		});

		toast.promise(updateRevProm, {
			loading: `Updating revision status to ${newStatus}...`,
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});
	}
	function addRevision() {
		if (!project) return;
		addRevisionOpen = false;
		const addRevProm = fetch('/api/projects/' + project.id + '/revision/add', {
			method: 'POST',
			body: JSON.stringify(revisionForm)
		}).then(async (res) => {
			const apiResponse: ApiResponse<ProjectRevision> = await res.json();
			if (!apiResponse.success) {
				throw new Error(parseError(apiResponse.error));
			}

			await invalidateAll();
			return apiResponse;
		});

		toast.promise(addRevProm, {
			loading: 'trying to create a revision',
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});
	}

	function isCurrentOwner(id: string | undefined) {
		if (!id) {
			return false;
		}
		return (
			project?.project_members?.some((member) => member.user.id === id && member.is_owner) ?? false
		);
	}

	async function handlePostInvite(userId: string, roleId: string, isOwner: boolean) {
		const addMemberProm = fetch('/api/projects/' + project?.id + '/members/add', {
			method: 'POST',
			body: JSON.stringify({
				project_id: project?.id,
				user_id: userId,
				role_id: roleId,
				isOwner: isOwner
			})
		}).then(async (res) => {
			const apiResponse: ApiResponse<ProjectMember[]> = await res.json();
			if (!apiResponse.success) {
				throw new Error(parseError(apiResponse.error));
			}

			await invalidateAll();
			return apiResponse;
		});

		toast.promise(addMemberProm, {
			loading: 'trying to add new member....',
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});
	}

	async function handleDeleteMember(member: ProjectMember) {
		const addMemberProm = fetch('/api/projects/' + project?.id + '/members/delete/' + member.id, {
			method: 'DELETE'
		}).then(async (res) => {
			const apiResponse: ApiResponse<string> = await res.json();
			if (!apiResponse.success) {
				throw new Error(parseError(apiResponse.error));
			}

			await invalidateAll();
			return apiResponse;
		});

		toast.promise(addMemberProm, {
			loading: 'trying to remove member from project....',
			success: (result) => result.message,
			error: (err) => {
				if (err instanceof Error) return err.message;
				return 'Something went wrong';
			},
			duration: 2000
		});
	}

	const isOwner = $state<boolean>(isCurrentOwner(currentUserStore.data?.id));
</script>

<div class="min-h-0 overflow-y-auto bg-background pb-12 font-sans text-foreground">
	<Toaster richColors theme={themeData.value} position="top-right" />

	{#if project}
		<header class="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
			<div class="mx-auto max-w-7xl px-6 py-5">
				<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div class="flex items-center gap-4">
						<h1 class="text-2xl font-bold tracking-tight">{project.name}</h1>
						<Badge variant="secondary">
							{project.status}
						</Badge>
					</div>

					<EditProjectDialog bind:editProjectOpen bind:projectForm {saveProject} />
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-7xl px-6 py-8">
			<div class="grid grid-cols-1 gap-10 lg:grid-cols-3">
				<div class="space-y-6 lg:col-span-2">
					<Tabs value="tasks" class="w-full">
						<TabsList
							class="inline-flex h-auto w-full justify-start overflow-x-auto overflow-y-hidden rounded-2xl border border-border bg-muted/40 p-1.5 whitespace-nowrap"
						>
							{#each [{ value: 'tasks', label: 'Tasks & Progress', icon: RiBarChartBoxLine }, { value: 'revisions', label: 'Client Revisions', icon: RiChatQuoteLine }, { value: 'members', label: 'Team Members', icon: RiTeamLine }, { value: 'roles', label: 'Roles & Permissions', icon: RiShieldUserLine }] as tab}
								{@const Icon = tab.icon}

								<TabsTrigger
									value={tab.value}
									class="flex-1 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
								>
									<div class="flex items-center justify-center gap-2">
										<Icon class="h-4 w-4" />
										<span class="hidden sm:inline">
											{tab.label}
										</span>
									</div>
								</TabsTrigger>
							{/each}
						</TabsList>

						<TabsContent value="tasks" class="pt-6 outline-none">
							<div class="mb-6 flex items-center justify-between">
								<h2 class="text-lg font-semibold">Development Timeline</h2>
								<!-- add task dialog -->
								<AddProjectTask isowner={isOwner} bind:addProgressOpen {project} onAdd={addProgress}
								></AddProjectTask>
							</div>

							{#if project.progress.length === 0}
								<div
									class="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground"
								>
									No tasks available. Start by adding a task.
								</div>
							{:else}
								<div class="relative pl-3">
									{#each project.progress as task, i (task.id)}
										<div class="group relative pb-8 last:pb-0">
											{#if i !== project.progress.length - 1}
												<div
													class="absolute top-7 bottom-[-7px] left-[11px] w-px bg-border transition-colors group-hover:bg-muted-foreground/30"
												></div>
											{/if}

											<div class="flex items-start gap-4">
												<button
													onclick={() => toggleProgress(task)}
													class="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-colors
								   {task.is_completed
														? 'border-primary bg-primary text-primary-foreground'
														: 'border-muted-foreground hover:border-primary'}"
												>
													{#if task.is_completed}
														<RiCheckLine class="h-3.5 w-3.5" />
													{/if}
												</button>

												<div
													class="flex-1 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
												>
													<div
														class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"
													>
														<div>
															<h3
																class={`text-sm font-medium ${task.is_completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}
															>
																{task.title}
															</h3>
															<div class="mt-3 flex items-center gap-3">
																<div class="flex items-center gap-1.5">
																	<Avatar class="h-5 w-5">
																		<AvatarImage
																			src={task.member.user.profile_picture}
																			referrerpolicy="no-referrer"
																		></AvatarImage>
																		<AvatarFallback class="bg-muted text-[9px]"
																			>{initials(task.member.user.full_name)}</AvatarFallback
																		>
																	</Avatar>
																	<span class="text-xs text-muted-foreground"
																		>{task.member.user.full_name}</span
																	>
																</div>
																<span class="text-xs text-muted-foreground">•</span>
																<span class="text-xs text-muted-foreground"
																	>{formatDate(task.created_at)}</span
																>
															</div>
														</div>

														<div class="flex shrink-0 items-center gap-3">
															<Badge
																variant="outline"
																class="border-border bg-muted/50 font-normal text-muted-foreground"
															>
																Weight: {task.weight}%
															</Badge>

															<AlertDialog>
																<AlertDialogTrigger>
																	{#snippet child({ props })}
																		<Button
																			{...props}
																			variant="ghost"
																			size="icon"
																			class="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
																		>
																			<RiDeleteBinLine class="h-4 w-4" />
																		</Button>
																	{/snippet}
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader
																		><AlertDialogTitle>Delete task?</AlertDialogTitle
																		></AlertDialogHeader
																	>
																	<AlertDialogFooter>
																		<AlertDialogCancel>Cancel</AlertDialogCancel>
																		<AlertDialogAction
																			onclick={() => deleteProgress(task.id)}
																			class="bg-destructive text-destructive-foreground"
																			>Delete</AlertDialogAction
																		>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														</div>
													</div>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</TabsContent>

						<TabsContent value="revisions" class="pt-6 outline-none">
							<!-- Header -->
							<div class="mb-6 flex items-center justify-between">
								<div class="space-y-0.5">
									<h2 class="text-lg font-semibold text-foreground">Revisions</h2>
									<div class="flex items-center gap-1.5">
										<p class="text-sm text-muted-foreground">Quota used:</p>
										<div class="flex items-center gap-1">
											{#each Array(project.allowed_revision_count) as _, i}
												<div
													class="h-1.5 w-4 rounded-full transition-colors {i <
													project.allowed_revision_count - remainingRevisions
														? 'bg-primary'
														: 'bg-muted'}"
												></div>
											{/each}
										</div>
										<span class="text-xs text-muted-foreground">
											{project.allowed_revision_count -
												remainingRevisions}/{project.allowed_revision_count}
										</span>
									</div>
								</div>

								{#if remainingRevisions > 0 && currentUserStore.data?.id === project.order?.user_id}
									<Dialog bind:open={addRevisionOpen}>
										<DialogTrigger>
											{#snippet child({ props })}
												<Button {...props} size="sm" class="gap-1.5">
													<RiChatQuoteLine class="h-4 w-4" />
													Request Revision
												</Button>
											{/snippet}
										</DialogTrigger>
										<DialogContent class="sm:max-w-md">
											<DialogHeader>
												<DialogTitle class="flex items-center gap-2.5 text-base">
													<span
														class="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"
													>
														<RiChatQuoteLine class="h-4 w-4" />
													</span>
													Request a Revision
												</DialogTitle>
												<DialogDescription class="text-sm text-muted-foreground">
													Submit your feedback and describe what needs to change.
												</DialogDescription>
											</DialogHeader>
											<Separator />
											<div class="space-y-4 py-1">
												<div class="space-y-1.5">
													<Label class="text-sm font-medium">Issue Title</Label>
													<Input
														bind:value={revisionForm.title}
														placeholder="e.g. Wrong color on header section"
														class="h-9"
													/>
												</div>
												<div class="space-y-1.5">
													<Label class="text-sm font-medium">Reason / Details</Label>
													<Textarea
														bind:value={revisionForm.reason}
														rows={4}
														placeholder="Describe the issue in detail..."
														class="resize-none text-sm"
													/>
												</div>
											</div>
											<Separator />
											<DialogFooter class="gap-2 sm:gap-2">
												<Button
													variant="outline"
													size="sm"
													onclick={() => (addRevisionOpen = false)}
												>
													Cancel
												</Button>
												<Button
													size="sm"
													onclick={addRevision}
													disabled={!revisionForm.title.trim() || !revisionForm.reason.trim()}
													class="gap-1.5"
												>
													<RiChatQuoteLine class="h-4 w-4" />
													Submit Revision
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								{/if}
							</div>

							<!-- List -->
							<div class="space-y-2">
								{#each project.project_revision ?? [] as rev, i}
									{@const status = getStatus(rev.status)}
									<div
										class="group rounded-lg border border-border bg-card transition-colors hover:bg-muted/20"
									>
										<!-- Top bar -->
										<div class="flex items-center gap-3 px-4 py-3">
											<!-- Index pill -->
											<span class="shrink-0 font-mono text-xs text-muted-foreground">
												REV-{String(rev.id).slice(0, 9)}...
											</span>

											<Separator orientation="vertical" class="h-4" />

											<!-- Title -->
											<p class="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
												{rev.title}
											</p>

											<!-- Status badge -->
											<span
												class="shrink-0 rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide {status.class}"
											>
												{status.label.toUpperCase()}
											</span>

											<!-- Update status dropdown -->
											<DropdownMenu.Root>
												<DropdownMenu.Trigger>
													{#snippet child({ props })}
														<Button
															{...props}
															variant="ghost"
															size="icon"
															class="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
														>
															<RiMoreLine class="h-4 w-4" />
														</Button>
													{/snippet}
												</DropdownMenu.Trigger>
												<DropdownMenu.Content align="end" class="w-44">
													<DropdownMenu.Label
														class="text-xs font-semibold text-muted-foreground uppercase"
													>
														Update Status
													</DropdownMenu.Label>
													<DropdownMenu.Separator />
													<DropdownMenu.Item
														onclick={() => updateRevisionStatus(rev.id, 'pending')}
														class="cursor-pointer gap-2 text-sm"
													>
														<div class="h-2 w-2 rounded-full bg-amber-500"></div>
														Pending
													</DropdownMenu.Item>
													<DropdownMenu.Item
														onclick={() => updateRevisionStatus(rev.id, 'accepted')}
														class="cursor-pointer gap-2 text-sm"
													>
														<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
														Accepted
													</DropdownMenu.Item>
													<DropdownMenu.Item
														onclick={() => updateRevisionStatus(rev.id, 'rejected')}
														class="cursor-pointer gap-2 text-sm"
													>
														<div class="h-2 w-2 rounded-full bg-destructive"></div>
														Rejected
													</DropdownMenu.Item>
												</DropdownMenu.Content>
											</DropdownMenu.Root>
										</div>

										<Separator />

										<!-- Reason -->
										<div class="px-4 py-3">
											<p class="text-sm leading-relaxed text-muted-foreground">{rev.reason}</p>
										</div>

										<!-- Footer -->
										<div class="flex items-center gap-1.5 border-t border-border px-4 py-2">
											<RiTimeLine class="h-3 w-3 text-muted-foreground" />
											<span class="text-xs text-muted-foreground">
												Requested on {formatDate(rev.created_at)}
											</span>
										</div>
									</div>
								{:else}
									<div
										class="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-14 text-center"
									>
										<div
											class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50"
										>
											<RiChatQuoteLine class="h-5 w-5 text-muted-foreground" />
										</div>
										<h3 class="text-sm font-medium text-foreground">No revisions yet</h3>
										<p class="mt-1 text-xs text-muted-foreground">
											When a client requests a change, it will appear here.
										</p>
									</div>
								{/each}
							</div>
						</TabsContent>

						<!-- PROJECT MEMBER -->
						<TabsContent value="members" class="pt-6 outline-none">
							<div class="mb-6 flex items-center justify-between">
								<h2 class="text-lg font-semibold">Project Team</h2>
								<AddNewMemberDialog
									bind:open={addMemberOpen}
									existingMembers={project.project_members}
									onInvite={handlePostInvite}
								></AddNewMemberDialog>
							</div>
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
								{#each project.project_members as member}
									{@const role = getRole(member)}

									<div
										class="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40"
									>
										<div class="relative shrink-0">
											<Avatar class="h-9 w-9">
												<AvatarImage
													src={member.user.profile_picture}
													referrerpolicy="no-referrer"
												/>
												<AvatarFallback class="bg-muted text-xs font-medium text-muted-foreground">
													{initials(member.user.full_name)}
												</AvatarFallback>
											</Avatar>

											{#if role === 'OWNER'}
												<span
													class="absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary ring-2 ring-card"
												>
													<RiCheckLine class="h-2 w-2 text-primary-foreground" />
												</span>
											{/if}
										</div>

										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-1.5">
												<p class="truncate text-sm leading-tight font-medium text-foreground">
													{member.user.full_name}
												</p>
											</div>

											<p class="truncate text-xs text-muted-foreground">
												{member.user.email}
											</p>
										</div>

										<div class="flex items-center gap-2">
											<Badge
												variant={role === 'OWNER'
													? 'default'
													: role === 'CLIENT'
														? 'outline'
														: 'secondary'}
												class="shrink-0 text-[10px] font-medium tracking-wide"
											>
												{role}
											</Badge>
											<Badge variant={'outline'}>
												{member.role.role_name}
											</Badge>
											{#if isOwner}
												{#if member.user.id != currentUserStore.data?.id}
													<DropdownMenu.Root>
														<DropdownMenu.Trigger>
															{#snippet child({ props })}
																<Button
																	{...props}
																	size="icon"
																	variant="ghost"
																	class="h-8 w-8 shrink-0 opacity-60 hover:opacity-100"
																>
																	<RiMore2Fill class="h-4 w-4" />
																</Button>
															{/snippet}
														</DropdownMenu.Trigger>

														<DropdownMenu.Content align="end" class="w-40">
															<!-- <DropdownMenu.Item
															onclick={() => handleUpdateMember(member)}
															class="cursor-pointer"
														>
															<RiEdit2Line class="mr-2 h-4 w-4" />
															<span>Edit</span>
														</DropdownMenu.Item> -->

															<DropdownMenu.Item
																onclick={() => handleDeleteMember(member)}
																class="cursor-pointer text-destructive focus:text-destructive"
															>
																<RiDeleteBinLine class="mr-2 h-4 w-4" />
																<span>Delete</span>
															</DropdownMenu.Item>
														</DropdownMenu.Content>
													</DropdownMenu.Root>
												{/if}
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</TabsContent>

						<TabsContent value="roles" class="pt-6 outline-none">
							<ProjectRolesTab></ProjectRolesTab>
						</TabsContent>
					</Tabs>
				</div>

				<aside class="space-y-6 lg:col-span-1">
					<Card class="border-border bg-card shadow-sm">
						<CardHeader class="pb-3"
							><CardTitle class="text-sm font-semibold text-foreground"
								>About this Project</CardTitle
							></CardHeader
						>
						<CardContent class="text-sm leading-relaxed text-muted-foreground">
							{project.description || 'No description provided.'}
						</CardContent>
					</Card>

					<Card class="border-border bg-card shadow-sm">
						<CardHeader class="pb-3"
							><CardTitle class="text-sm font-semibold text-foreground">Details</CardTitle
							></CardHeader
						>
						<CardContent class="space-y-4">
							<div class="grid grid-cols-2 gap-y-4 text-sm">
								<div class="flex items-center gap-2 text-muted-foreground">
									<RiCalendarEventLine class="h-4 w-4" /> Start Date
								</div>
								<div class="text-right text-foreground">
									{formatDate(project.actual_start_date)}
								</div>

								<div class="flex items-center gap-2 text-muted-foreground">
									<RiTimeLine class="h-4 w-4" /> Due Date
								</div>
								<div class="text-right font-medium text-foreground">
									{formatDate(project.end_date)}
								</div>

								<div class="flex items-center gap-2 text-muted-foreground">
									<RiPulseLine class="h-4 w-4" /> Project Value
								</div>
								<div class="text-right text-foreground">
									{project.order ? formatCurrency(project.order.ordered_price) : '—'}
								</div>
							</div>

							<Separator class="bg-border" />

							<div class="space-y-2">
								<div class="flex items-center justify-between text-sm">
									<span class="font-medium text-muted-foreground">Overall Progress</span>
									<span class="font-bold text-primary">{progressPercent}%</span>
								</div>
								<Progress value={progressPercent} class="h-2 rounded-full" />
								<p class="text-right text-xs text-muted-foreground">
									{completedWeight} of {totalWeight} total weight
								</p>
							</div>

							<Separator class="bg-border" />

							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<RiRefreshLine class="h-4 w-4" /> Revisions Left
								</div>
								<div class="flex items-center gap-1.5">
									<span
										class="text-sm font-semibold {remainingRevisions === 0
											? 'text-destructive'
											: 'text-foreground'}"
									>
										{remainingRevisions}
									</span>
									<span class="text-xs text-muted-foreground"
										>/ {project.allowed_revision_count}</span
									>
								</div>
							</div>
						</CardContent>
					</Card>
				</aside>
			</div>
		</main>
	{:else}
		<div class="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
			<div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<RiShieldLine class="h-8 w-8 text-muted-foreground" />
			</div>
			<div class="space-y-1.5">
				<h2 class="text-lg font-semibold text-foreground">Access Restricted</h2>
				<p class="max-w-xs text-sm text-muted-foreground">
					You are not a member of this project and cannot view its details.
				</p>
			</div>
			<Separator class="max-w-xs" />
			<Button variant="outline" size="sm" onclick={() => history.back()} class="gap-1.5">
				<RiArrowLeftLine class="h-4 w-4" />
				Go Back
			</Button>
		</div>
	{/if}
</div>
