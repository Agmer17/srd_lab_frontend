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
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	// Remix Icons
	import {
		RiMore2Fill,
		RiFolderOpenLine,
		RiEditBoxLine,
		RiDeleteBinLine,
		RiSearchLine,
		RiFilter3Line,
		RiFolderInfoLine
	} from 'remixicon-svelte';
	import type { Project, ProjectProgress } from '$lib/types/projects.js';
	import { goto } from '$app/navigation';

	const { data } = $props();

	const rawProjects: Project[] = $derived(data.projects || []);

	// --- STATE ---
	let searchQuery = $state('');
	let activeTab = $state('all');

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

	// --- HELPER FUNCTIONS ---
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
		const date = new Date(isoString);
		return new Intl.DateTimeFormat('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(date);
	}

	function getInitials(name: string): string {
		return name.substring(0, 1).toUpperCase();
	}

	function formatStatusLabel(status: string): string {
		return status
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	// Layout Helpers using strict theme CSS variables
	function getCardBorderClass(status: string): string {
		switch (status.toLowerCase()) {
			case 'in_progress':
				return 'border-t-secondary'; // Blue/Brand
			case 'completed':
				return 'border-t-chart-4'; // Secondary Color
			case 'cancelled':
				return 'border-t-destructive'; // Red
			case 'pending':
				return 'border-t-accent'; // Yellowish/Accent
			default:
				return 'border-t-border';
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
</script>

<div class="min-h-0 overflow-y-auto bg-background pb-12 text-foreground">
	<main class="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
		<div class="space-y-1">
			<h1 class="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
			<p class="text-sm text-muted-foreground">Manage and track your active projects progress.</p>
		</div>

		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<Card class="border-border/50 bg-card shadow-xs">
				<CardContent class="flex flex-col justify-center space-y-1 p-4 sm:p-5">
					<span class="text-sm font-medium text-muted-foreground">Total Projects</span>
					<div class="flex items-baseline gap-2">
						<span class="text-2xl font-bold text-foreground">{totalProjects}</span>
					</div>
				</CardContent>
			</Card>
			<Card class="border-border/50 bg-card shadow-xs">
				<CardContent class="flex flex-col justify-center space-y-1 p-4 sm:p-5">
					<span class="text-sm font-medium text-muted-foreground">Active</span>
					<div class="flex items-baseline gap-2">
						<span class="text-2xl font-bold text-foreground">{activeProjects}</span>
					</div>
				</CardContent>
			</Card>
			<Card class="border-border/50 bg-card shadow-xs">
				<CardContent class="flex flex-col justify-center space-y-1 p-4 sm:p-5">
					<span class="text-sm font-medium text-muted-foreground">Completed</span>
					<div class="flex items-baseline gap-2">
						<span class="text-2xl font-bold text-foreground">{completedProjects}</span>
					</div>
				</CardContent>
			</Card>
			<Card class="border-border/50 bg-card shadow-xs">
				<CardContent class="flex flex-col justify-center space-y-1 p-4 sm:p-5">
					<span class="text-sm font-medium text-muted-foreground">Success Rate</span>
					<div class="flex items-baseline gap-2">
						<span class="text-2xl font-bold text-foreground">{successRate}%</span>
					</div>
				</CardContent>
			</Card>
		</div>

		<div
			class="flex flex-col items-start justify-between gap-4 overflow-y-hidden md:flex-row md:items-center"
		>
			<div class="relative w-full md:w-72">
				<RiSearchLine
					class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					placeholder="Search projects..."
					bind:value={searchQuery}
					class="w-full border-border/60 bg-card pl-9 shadow-xs transition-shadow focus-visible:ring-1"
				/>
			</div>

			<div class="flex w-full items-center gap-3 overflow-x-auto pb-1 md:w-auto md:pb-0">
				<Tabs bind:value={activeTab} class="w-full md:w-auto">
					<TabsList class="h-9 shrink-0 bg-muted/60">
						<TabsTrigger value="all" class="px-4 text-xs">All</TabsTrigger>
						<TabsTrigger value="in_progress" class="px-4 text-xs">Active</TabsTrigger>
						<TabsTrigger value="completed" class="px-4 text-xs">Completed</TabsTrigger>
						<TabsTrigger value="cancelled" class="px-4 text-xs">Cancelled</TabsTrigger>
					</TabsList>
				</Tabs>
				<Button
					variant="outline"
					size="icon"
					class="h-9 w-9 shrink-0 border-border/60 bg-card shadow-xs"
				>
					<RiFilter3Line class="h-4 w-4 text-muted-foreground" />
				</Button>
			</div>
		</div>

		{#if filteredProjects.length === 0}
			<div
				in:fade={{ duration: 200 }}
				class="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 py-20 text-center"
			>
				<RiFolderInfoLine class="mb-3 h-10 w-10 text-muted-foreground/50" />
				<h3 class="text-base font-semibold text-foreground">No projects found</h3>
				<p class="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredProjects as project (project.id)}
					{@const progressPercentage = calculateProgress(project.progress)}

					<Card
						onclick={() => gotoProjectDetails(project.id)}
						class="relative flex flex-col overflow-hidden border-t-[3px] bg-card shadow-xs transition-all hover:cursor-pointer hover:shadow-sm {getCardBorderClass(
							project.status
						)}"
					>
						<CardContent class="flex flex-1 flex-col gap-4 p-4 sm:p-5">
							<div class="flex items-start justify-between gap-4">
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-lg font-bold text-primary"
								>
									{getInitials(project.name)}
								</div>

								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class="-mt-1 -mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
									>
										<RiMore2Fill class="h-4 w-4" />
									</DropdownMenu.Trigger>

									<DropdownMenu.Content align="end" class="w-40 rounded-xl border-border/50">
										<DropdownMenu.Item
											class="cursor-pointer gap-2"
											onclick={() => gotoProjectDetails(project.id)}
										>
											<RiFolderOpenLine class="h-4 w-4" />
											View Details
										</DropdownMenu.Item>

										<DropdownMenu.Item class="cursor-pointer gap-2">
											<RiEditBoxLine class="h-4 w-4" />
											Edit
										</DropdownMenu.Item>

										<DropdownMenu.Separator />

										<DropdownMenu.Item
											class="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
										>
											<RiDeleteBinLine class="h-4 w-4" />
											Delete
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>

							<div class="space-y-1.5">
								<div>
									<h3
										class="line-clamp-1 cursor-pointer text-base leading-tight font-semibold text-foreground transition-colors hover:text-primary"
									>
										{project.name}
									</h3>
									<p class="mt-0.5 text-[11px] font-medium text-muted-foreground sm:text-xs">
										Started {formatDate(project.actual_start_date)} • Due {formatDate(
											project.end_date
										)}
									</p>
								</div>

								<p class="line-clamp-2 text-sm text-muted-foreground">
									{project.description || 'No project description provided.'}
								</p>
							</div>

							<div class="flex-1"></div>

							<div class="mt-2 space-y-2">
								<div
									class="flex items-center justify-between text-xs font-semibold text-muted-foreground"
								>
									<span>Progress</span>
									<span class="text-foreground">{progressPercentage}%</span>
								</div>
								{#if progressPercentage == 100}
									<Progress value={progressPercentage} class="h-1.5 rounded-full [&>div]:bg-chart-4"
									></Progress>
								{:else}
									<Progress
										value={progressPercentage}
										class="h-1.5 rounded-full [&>div]:bg-secondary"
									></Progress>
								{/if}
							</div>

							<div class="flex items-center justify-between pt-2">
								<div class="flex -space-x-2 rtl:space-x-reverse">
									{#each project.project_members.slice(0, 3) as member (member.id)}
										<Avatar
											class="h-7 w-7 border-2 border-card shadow-xs transition-transform hover:z-10 hover:scale-110 sm:h-8 sm:w-8"
										>
											<AvatarImage
												src={member.user.profile_picture || undefined}
												alt={member.user.full_name}
												class="object-cover"
												referrerpolicy="no-referrer"
											/>
											<AvatarFallback class="bg-primary/10 text-[10px] font-semibold text-primary">
												{getInitials(member.user.full_name)}
											</AvatarFallback>
										</Avatar>
									{/each}
									{#if project.project_members.length > 3}
										<div
											class="z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-muted-foreground sm:h-8 sm:w-8"
										>
											+{project.project_members.length - 3}
										</div>
									{/if}
								</div>

								<Badge
									variant={getBadgeVariant(project.status)}
									class="rounded-md px-2.5 py-0.5 text-[11px] font-medium shadow-xs sm:text-xs"
								>
									{formatStatusLabel(project.status)}
								</Badge>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	</main>
</div>
