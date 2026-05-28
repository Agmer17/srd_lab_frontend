<script lang="ts">
	import { fade } from 'svelte/transition';

	// Shadcn Components
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Progress } from '$lib/components/ui/progress';

	// Remix Icons
	import { RiSearchLine, RiFilter3Line, RiFolderInfoLine, RiAddLine } from 'remixicon-svelte';

	import type { Project, ProjectProgress, ProjectRole } from '$lib/types/projects.js';
	import { goto, invalidateAll } from '$app/navigation';
	import { currentUserStore } from '$lib/state/currentUser.svelte';

	// IMPORT COMPONENT MODAL BARU
	import CreateProjectModal from '$lib/components/projects/CreateProjectModal.svelte';
	import type { OrderListDTO } from '$lib/types/order.js';
	import type { ApiResponse } from '$lib/types/api.js';

	let { data } = $props();

	let rawProjects: Project[] = $derived(data.projects || []);
	let availableOrders = $state<OrderListDTO[]>([]);
	let projectRoles = $state<ProjectRole[]>([]);

	let isAdmin = $derived(currentUserStore.data?.global_role === 'ADMIN');

	// --- FILTER & MODAL STATE ---
	let searchQuery = $state('');
	let activeTab = $state('all');
	let isDialogOpen = $state(false);

	// --- DERIVED DATA ---
	let filteredProjects = $derived(
		rawProjects.filter((project) => {
			const matchesSearch =
				project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.description?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = activeTab === 'all' ? true : project.status === activeTab;
			return matchesSearch && matchesStatus;
		})
	);

	let totalProjects = $derived(rawProjects.length);
	let activeProjects = $derived(rawProjects.filter((p) => p.status === 'in_progress').length);
	let completedProjects = $derived(rawProjects.filter((p) => p.status === 'completed').length);
	let successRate = $derived(
		totalProjects === 0 ? 0 : Math.round((completedProjects / totalProjects) * 100)
	);

	// --- HELPERS ---
	function calculateProgress(progressArr: ProjectProgress[]): number {
		if (!progressArr || progressArr.length === 0) return 0;
		const totalWeight = progressArr.reduce((acc, curr) => acc + curr.weight, 0);
		const completedWeight = progressArr.reduce(
			(acc, curr) => acc + (curr.is_completed ? curr.weight : 0),
			0
		);
		return totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);
	}

	function formatDate(isoString: string | null | undefined): string {
		if (!isoString) return 'TBD';
		return new Intl.DateTimeFormat('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(isoString));
	}

	function getInitials(name: string): string {
		return name.substring(0, 1).toUpperCase();
	}

	function formatStatusLabel(status: string): string {
		return status
			.split('_')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}

	// Mengubah border-t menjadi border-l untuk style ala Jira/Linear
	function getCardBorderClass(status: string): string {
		switch (status.toLowerCase()) {
			case 'in_progress':
				return 'border-l-secondary';
			case 'completed':
				return 'border-l-chart-4';
			case 'cancelled':
				return 'border-l-destructive';
			case 'pending':
				return 'border-l-accent';
			default:
				return 'border-l-border';
		}
	}

	function getBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status.toLowerCase()) {
			case 'in_progress':
				return 'secondary';
			case 'completed':
				return 'outline';
			case 'cancelled':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function gotoProjectDetails(projectId: string) {
		goto('/projects/details/' + projectId);
	}

	async function openCreateProjectModal() {
		try {
			const [ordersRes, rolesRes] = await Promise.all([
				fetch('/api/orders/all'),
				fetch('/api/project-role/all')
			]);

			const ordersData: ApiResponse<OrderListDTO[]> = await ordersRes.json();
			const rolesData: ApiResponse<ProjectRole[]> = await rolesRes.json();

			if (ordersData.success) {
				const usedOrderIds = new Set(
					rawProjects.map((project) => project.order_id).filter(Boolean)
				);
				availableOrders = (ordersData.data ?? ordersData).filter(
					(order) => !usedOrderIds.has(order.id)
				);
			}
			if (rolesData.success) {
				projectRoles = rolesData.data ?? rolesData;
			}

			isDialogOpen = true;
		} catch (error) {
			console.error('Error fetching modal data:', error);
		}
	}
</script>

<div class="min-h-0 overflow-y-auto bg-background/95 pb-12 text-foreground">
	<main class="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
		<div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
			<div class="space-y-4">
				<div class="flex items-center justify-between gap-4 lg:justify-start">
					<div class="space-y-1">
						<h1 class="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
						<p class="text-sm text-muted-foreground">
							{#if isAdmin}
								Manage, monitor, and track progress across all active client projects.
							{:else}
								View and track the progress of your requested projects in one place.
							{/if}
						</p>
					</div>
				</div>

				<div
					class="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-lg border border-border/40 bg-card/50 px-5 py-3 shadow-xs"
				>
					<div class="flex flex-col">
						<span class="text-xs font-medium text-muted-foreground">Total Projects</span>
						<span class="text-lg font-bold text-foreground">{totalProjects}</span>
					</div>
					<div class="hidden h-8 w-px bg-border/50 sm:block"></div>
					<div class="flex flex-col">
						<span class="text-xs font-medium text-muted-foreground">Active</span>
						<span class="text-lg font-bold text-foreground">{activeProjects}</span>
					</div>
					<div class="hidden h-8 w-px bg-border/50 sm:block"></div>
					<div class="flex flex-col">
						<span class="text-xs font-medium text-muted-foreground">Completed</span>
						<span class="text-lg font-bold text-foreground">{completedProjects}</span>
					</div>
					<div class="hidden h-8 w-px bg-border/50 sm:block"></div>
					<div class="flex flex-col">
						<span class="text-xs font-medium text-muted-foreground">Success Rate</span>
						<span class="text-lg font-bold text-foreground">{successRate}%</span>
					</div>
				</div>
			</div>

			{#if isAdmin}
				<div class="shrink-0">
					<Button onclick={() => openCreateProjectModal()} class="w-full gap-2 shadow-sm lg:w-auto">
						<RiAddLine class="h-4 w-4" />
						New Project
					</Button>
				</div>

				<CreateProjectModal
					bind:open={isDialogOpen}
					orders={availableOrders}
					{projectRoles}
					onSuccess={async () => {
						await invalidateAll();
					}}
				/>
			{/if}
		</div>

		<div
			class="flex flex-col items-start justify-between gap-4 rounded-lg border border-border/30 bg-card/30 p-1 md:flex-row md:items-center"
		>
			<Tabs bind:value={activeTab} class="w-full md:w-auto">
				<TabsList class="h-10 w-full justify-start bg-transparent md:w-auto">
					<TabsTrigger
						value="all"
						class="px-5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>All</TabsTrigger
					>
					<TabsTrigger
						value="in_progress"
						class="px-5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>Active</TabsTrigger
					>
					<TabsTrigger
						value="completed"
						class="px-5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>Completed</TabsTrigger
					>
					<TabsTrigger
						value="cancelled"
						class="px-5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
						>Cancelled</TabsTrigger
					>
				</TabsList>
			</Tabs>

			<div class="flex w-full items-center gap-2 px-1 pb-1 md:w-auto md:pb-0">
				<div class="relative w-full md:w-64">
					<RiSearchLine
						class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						placeholder="Search projects..."
						bind:value={searchQuery}
						class="h-9 w-full border-border/60 bg-background pl-9 shadow-xs focus-visible:ring-1"
					/>
				</div>
				<Button
					variant="outline"
					size="icon"
					class="h-9 w-9 shrink-0 border-border/60 bg-background shadow-xs"
				>
					<RiFilter3Line class="h-4 w-4 text-muted-foreground" />
				</Button>
			</div>
		</div>

		{#if filteredProjects.length === 0}
			<div
				in:fade={{ duration: 200 }}
				class="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/20 py-24 text-center"
			>
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
					<RiFolderInfoLine class="h-6 w-6 text-muted-foreground" />
				</div>
				<h3 class="text-lg font-medium text-foreground">No projects found</h3>
				<p class="mt-1 max-w-sm text-sm text-muted-foreground">
					Try adjusting your search query or switching tabs to find what you're looking for.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredProjects as project (project.id)}
					{@const progressPercentage = calculateProgress(project.progress)}

					<Card
						onclick={() => gotoProjectDetails(project.id)}
						class="group relative flex flex-col overflow-hidden border-l-[4px] bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:cursor-pointer hover:shadow-md {getCardBorderClass(
							project.status
						)}"
					>
						<CardContent class="flex flex-1 flex-col p-5">
							<div class="flex items-start justify-between gap-4">
								<div class="flex items-start gap-3">
									<div
										class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-sm font-bold text-primary"
									>
										{getInitials(project.name)}
									</div>
									<div class="space-y-1">
										<h3
											class="line-clamp-1 text-base leading-none font-semibold text-foreground transition-colors group-hover:text-primary"
										>
											{project.name}
										</h3>
										<p class="text-[11px] font-medium text-muted-foreground sm:text-xs">
											{formatDate(project.actual_start_date)} — {formatDate(project.end_date)}
										</p>
									</div>
								</div>
								<Badge
									variant={getBadgeVariant(project.status)}
									class="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase shadow-none"
								>
									{formatStatusLabel(project.status)}
								</Badge>
							</div>

							<p class="mt-4 line-clamp-2 text-sm text-muted-foreground/90">
								{project.description || 'No project description provided.'}
							</p>

							<div class="flex-1"></div>

							<div class="mt-6 border-t border-border/40 pt-4">
								<div class="flex items-end justify-between gap-4">
									<div class="flex-1 space-y-2">
										<div class="flex items-center justify-between text-xs font-medium">
											<span class="text-muted-foreground">Progress</span>
											<span class="text-foreground">{progressPercentage}%</span>
										</div>
										<Progress
											value={progressPercentage}
											class="h-1.5 rounded-full bg-muted/60 {progressPercentage === 100
												? '[&>div]:bg-chart-4'
												: '[&>div]:bg-secondary'}"
										/>
									</div>

									<div class="flex shrink-0 -space-x-2 rtl:space-x-reverse">
										{#each project.project_members.slice(0, 3) as member (member.id)}
											<Avatar
												class="h-7 w-7 border-2 border-card shadow-xs transition-transform hover:z-10 hover:scale-110"
											>
												<AvatarImage
													src={member.user.profile_picture || undefined}
													alt={member.user.full_name}
													class="object-cover"
													referrerpolicy="no-referrer"
												/>
												<AvatarFallback
													class="bg-primary/10 text-[10px] font-semibold text-primary"
												>
													{getInitials(member.user.full_name)}
												</AvatarFallback>
											</Avatar>
										{/each}
										{#if project.project_members.length > 3}
											<div
												class="z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-muted-foreground"
											>
												+{project.project_members.length - 3}
											</div>
										{/if}
										{#if project.project_members.length === 0}
											<div
												class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-card bg-muted"
											>
												<span class="text-[10px] text-muted-foreground">-</span>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	</main>
</div>
