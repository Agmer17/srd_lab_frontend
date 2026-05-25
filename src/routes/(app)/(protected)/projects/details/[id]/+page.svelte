<script lang="ts">
	// Mengimpor Svelte runes & standard components
	import { slide, fade } from 'svelte/transition';

	import {
		RiFolderLine,
		RiTeamLine,
		RiCheckboxCircleLine,
		RiTimeLine,
		RiFlagLine,
		RiMore2Fill,
		RiSearchLine,
		RiAddLine,
		RiHistoryLine,
		RiArrowRightSLine,
		RiCalendarLine,
		RiInformationLine,
		RiRefreshLine,
		RiCheckDoubleLine
	} from 'remixicon-svelte';

	// Mengimpor shadcn-svelte components
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	// ==========================================
	// TYPE DEFINITIONS (Sesuai dengan spesifikasi)
	// ==========================================
	type ProjectMember = {
		id: string;
		project_id: string;
		user: {
			id: string;
			global_role: string;
			full_name: string;
			email: string;
			phone_number?: string | null;
			profile_picture?: string | null;
			gender?: string;
			created_at: string;
			updated_at: string;
			deleted_at?: string | null;
		};
		role: {
			id: string;
			role_name: string;
			created_at: string;
		};
		is_owner: boolean;
		joined_at: string;
		left_at?: string | null;
	};

	type ProjectProgress = {
		id: string;
		project_id: string;
		member: ProjectMember;
		title: string;
		weight: number;
		is_completed: boolean;
		created_at: string;
	};

	type ProjectRevision = {
		id: string;
		project_id: string;
		title: string;
		reason: string;
		status: string;
		created_at: string;
	};

	type Project = {
		id: string;
		order_id: string;
		name: string;
		description?: string | null;
		status: string;
		allowed_revision_count: number;
		project_members: ProjectMember[];
		progress: ProjectProgress[];
		project_revision?: ProjectRevision[];
		actual_start_date?: string | null;
		end_date?: string | null;
		created_at: string;
		updated_at: string;
	};

	// ==========================================
	// MOCK DATA (Realistic Production-Ready)
	// ==========================================
	const mockMembers: ProjectMember[] = [
		{
			id: 'pm-1',
			project_id: 'prj-101',
			user: {
				id: 'u-1',
				global_role: 'admin',
				full_name: 'Firdaus Hanafiah',
				email: 'firdaus@saascorp.com',
				profile_picture: null,
				created_at: '2025-01-10',
				updated_at: '2025-01-10'
			},
			role: { id: 'r-1', role_name: 'Product Manager', created_at: '2025-01-10' },
			is_owner: true,
			joined_at: '2026-01-12'
		},
		{
			id: 'pm-2',
			project_id: 'prj-101',
			user: {
				id: 'u-2',
				global_role: 'member',
				full_name: 'Sarah Amalia',
				email: 'sarah.a@saascorp.com',
				profile_picture: null,
				created_at: '2025-02-14',
				updated_at: '2025-02-14'
			},
			role: { id: 'r-2', role_name: 'Lead UI/UX Designer', created_at: '2025-02-14' },
			is_owner: false,
			joined_at: '2026-01-14'
		},
		{
			id: 'pm-3',
			project_id: 'prj-101',
			user: {
				id: 'u-3',
				global_role: 'member',
				full_name: 'Rian Dimas',
				email: 'rian.d@saascorp.com',
				profile_picture: null,
				created_at: '2025-03-01',
				updated_at: '2025-03-01'
			},
			role: { id: 'r-3', role_name: 'Senior Frontend Engineer', created_at: '2025-03-01' },
			is_owner: false,
			joined_at: '2026-01-15'
		}
	];

	const initialProject: Project = {
		id: 'prj-101',
		order_id: 'ORD-2026-8891',
		name: 'Next-Gen Core Platform Architecture v2',
		description:
			'Inisiatif rekonstruksi infrastruktur modular dan desain sistem antarmuka berbasis micro-frontend untuk meningkatkan reliabilitas transaksi inti platform SaaS hingga 40%.',
		status: 'In Progress',
		allowed_revision_count: 5,
		project_members: mockMembers,
		progress: [
			{
				id: 'prog-1',
				project_id: 'prj-101',
				member: mockMembers[0],
				title: 'Penyusunan High-Level Architecture Design & Node Cluster Mapping',
				weight: 25,
				is_completed: true,
				created_at: '2026-02-01 09:00'
			},
			{
				id: 'prog-2',
				project_id: 'prj-101',
				member: mockMembers[1],
				title: 'Finalisasi Komponen Tokenisasi Sistem Desain pada Figma Enterprise',
				weight: 20,
				is_completed: true,
				created_at: '2026-02-10 14:20'
			},
			{
				id: 'prog-3',
				project_id: 'prj-101',
				member: mockMembers[2],
				title: 'Migrasi State Management Svelte 4 Legacy ke Svelte 5 Runes',
				weight: 30,
				is_completed: false,
				created_at: '2026-02-18 11:00'
			},
			{
				id: 'prog-4',
				project_id: 'prj-101',
				member: mockMembers[2],
				title: 'Integrasi End-to-End Testing (E2E) via Playwright Engine',
				weight: 25,
				is_completed: false,
				created_at: '2026-02-22 16:45'
			}
		],
		project_revision: [
			{
				id: 'rev-1',
				project_id: 'prj-101',
				title: 'Penyesuaian Skema Payload Webhook Gateway',
				reason:
					'Perubahan mendadak spesifikasi integrasi API pihak ketiga pada modul enkripsi data.',
				status: 'Approved',
				created_at: '2026-02-14 10:00'
			},
			{
				id: 'rev-2',
				project_id: 'prj-101',
				title: 'Optimasi Latensi Query Audit Trail Log',
				reason:
					'Hasil stress test menunjukkan bottleneck masif saat concurrent users menyentuh batas 15k.',
				status: 'Under Review',
				created_at: '2026-02-24 08:15'
			}
		],
		actual_start_date: '2026-01-20',
		end_date: '2026-06-30',
		created_at: '2026-01-12',
		updated_at: '2026-02-24'
	};

	// ==========================================
	// APP STATE (Svelte 5 Runes)
	// ==========================================
	let project = $state<Project>(initialProject);
	let isLoading = $state<boolean>(false);
	let searchQuery = $state<string>('');
	let currentTab = $state<string>('tasks');
	let filterStatus = $state<string>('all'); // all, completed, active

	// ==========================================
	// COMPUTED / DERIVED DATA
	// ==========================================
	const totalTasks = $derived(project.progress.length);
	const completedTasks = $derived(project.progress.filter((t) => t.is_completed).length);

	const totalWeightCalculated = $derived(
		project.progress.reduce((sum, item) => sum + item.weight, 0)
	);
	const completedWeightSum = $derived(
		project.progress.filter((t) => t.is_completed).reduce((sum, item) => sum + item.weight, 0)
	);

	// Persentase kemajuan riil berbobot (weighted progress)
	const actualProgressPercentage = $derived(
		totalWeightCalculated > 0 ? Math.round((completedWeightSum / totalWeightCalculated) * 100) : 0
	);

	const activeMembersCount = $derived(project.project_members.length);
	const remainingRevisions = $derived(
		project.allowed_revision_count - (project.project_revision?.length || 0)
	);

	const filteredProgressList = $derived(
		project.progress.filter((item) => {
			const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
			if (filterStatus === 'completed') return matchesSearch && item.is_completed;
			if (filterStatus === 'active') return matchesSearch && !item.is_completed;
			return matchesSearch;
		})
	);

	// ==========================================
	// MUTATION HANDLERS
	// ==========================================
	function toggleTaskStatus(id: string) {
		project.progress = project.progress.map((task) => {
			if (task.id === id) {
				return { ...task, is_completed: !task.is_completed };
			}
			return task;
		});
	}

	function simulateReload() {
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
		}, 1200);
	}

	// Mengambil inisial nama untuk avatar fallback
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div
	class="min-h-0 overflow-y-auto bg-background text-foreground antialiased transition-colors duration-200"
>
	<!-- Top Navigation / Breadcrumb Header Bar -->
	<header
		class="sticky top-0 z-40 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md"
	>
		<div class="mx-auto flex max-w-7xl items-center justify-between">
			<div class="flex items-center gap-4">
				<Breadcrumb.Root>
					<Breadcrumb.List class="text-xs font-medium tracking-tight">
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/projects" class="transition-colors hover:text-foreground">
								Projects
							</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator>
							<RiArrowRightSLine class="size-3.5 text-muted-foreground" />
						</Breadcrumb.Separator>
						<Breadcrumb.Item>
							<Breadcrumb.Link
								href="/projects/core"
								class="transition-colors hover:text-foreground"
							>
								Core Engineering
							</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator>
							<RiArrowRightSLine class="size-3.5 text-muted-foreground" />
						</Breadcrumb.Separator>
						<Breadcrumb.Item>
							<Breadcrumb.Page class="font-semibold text-foreground">
								{project.order_id}
							</Breadcrumb.Page>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>

			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={simulateReload}
					disabled={isLoading}
					class="h-8 rounded-lg border-border bg-card px-3 text-xs font-medium hover:bg-muted"
				>
					<RiRefreshLine class="mr-1.5 size-3.5 animate-none" />
					Sync Data
				</Button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button
							variant="outline"
							size="icon"
							class="h-8 w-8 rounded-lg border-border bg-card hover:bg-muted"
						>
							<RiMore2Fill class="size-4" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						align="end"
						class="w-48 rounded-xl border-border bg-popover p-1 shadow-md"
					>
						<DropdownMenu.Item class="rounded-lg text-xs hover:bg-muted"
							>Edit Metadata</DropdownMenu.Item
						>
						<DropdownMenu.Item class="rounded-lg text-xs hover:bg-muted"
							>Configure Webhooks</DropdownMenu.Item
						>
						<Separator class="my-1 bg-border" />
						<DropdownMenu.Item class="rounded-lg text-xs text-destructive hover:bg-destructive/10"
							>Archive Project</DropdownMenu.Item
						>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-7xl p-6 md:p-8">
		{#if isLoading}
			<!-- SKELETON LOADING STATE -->
			<div class="space-y-8" transition:fade={{ duration: 150 }}>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<Skeleton class="h-6 w-24 rounded-md" />
						<Skeleton class="h-6 w-32 rounded-md" />
					</div>
					<Skeleton class="h-10 w-2/3 rounded-xl" />
					<Skeleton class="h-16 w-full rounded-xl" />
				</div>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5">
					{#each Array(5) as _}
						<Skeleton class="h-24 rounded-2xl" />
					{/each}
				</div>
				<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<div class="lg:col-span-2">
						<Skeleton class="h-96 rounded-2xl" />
					</div>
					<div>
						<Skeleton class="h-80 rounded-2xl" />
					</div>
				</div>
			</div>
		{:else}
			<div class="space-y-8" transition:fade={{ duration: 200 }}>
				<!-- PROJECT HEADER SECTION -->
				<section class="space-y-4">
					<div class="flex flex-wrap items-start justify-between gap-4">
						<div class="max-w-3xl space-y-2">
							<div class="flex flex-wrap items-center gap-2">
								<Badge
									variant="secondary"
									class="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground shadow-2xs"
								>
									<RiFolderLine class="mr-1 size-3" />
									Core Engineering
								</Badge>
								<Badge
									class="rounded-md bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground shadow-2xs"
								>
									{project.status}
								</Badge>
								<span class="font-mono text-xs text-muted-foreground">Updated 2h ago</span>
							</div>
							<h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
								{project.name}
							</h1>
							<p class="text-sm leading-relaxed text-muted-foreground">
								{project.description}
							</p>
						</div>

						<!-- Quick Target Metric Ring-like Card -->
						<div
							class="flex min-w-[200px] items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
						>
							<div class="w-full space-y-2">
								<div class="flex items-center justify-between text-xs font-semibold">
									<span class="text-muted-foreground">Completion Index</span>
									<span class="font-mono text-foreground">{actualProgressPercentage}%</span>
								</div>
								<Progress
									value={actualProgressPercentage}
									class="h-2 bg-muted [&>div]:bg-primary"
								/>
								<div class="flex justify-between font-mono text-[11px] text-muted-foreground">
									<span>{completedTasks} of {totalTasks} milestones</span>
									<span>{completedWeightSum}/{totalWeightCalculated} Wt</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- PROJECT STATISTICS SECTION -->
				<section class="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5">
					<!-- Stat 1 -->
					<Card.Root
						class="overflow-hidden rounded-2xl border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md"
					>
						<Card.Header class="p-4 pb-2">
							<Card.Description
								class="flex items-center justify-between text-xs font-medium text-muted-foreground"
							>
								Total Targets
								<RiCheckDoubleLine class="size-4 text-muted-foreground opacity-70" />
							</Card.Description>
						</Card.Header>
						<Card.Content class="p-4 pt-0">
							<div class="font-mono text-2xl font-bold tracking-tight text-foreground">
								{totalTasks}
							</div>
							<p class="mt-0.5 text-[11px] text-muted-foreground">Grand milestones allocated</p>
						</Card.Content>
					</Card.Root>

					<!-- Stat 2 -->
					<Card.Root
						class="overflow-hidden rounded-2xl border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md"
					>
						<Card.Header class="p-4 pb-2">
							<Card.Description
								class="flex items-center justify-between text-xs font-medium text-muted-foreground"
							>
								Completed
								<RiCheckboxCircleLine class="size-4 text-muted-foreground opacity-70" />
							</Card.Description>
						</Card.Header>
						<Card.Content class="p-4 pt-0">
							<div class="font-mono text-2xl font-bold tracking-tight text-foreground">
								{completedTasks}
							</div>
							<p class="mt-0.5 text-[11px] text-muted-foreground">Successfully validated</p>
						</Card.Content>
					</Card.Root>

					<!-- Stat 3 -->
					<Card.Root
						class="overflow-hidden rounded-2xl border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md"
					>
						<Card.Header class="p-4 pb-2">
							<Card.Description
								class="flex items-center justify-between text-xs font-medium text-muted-foreground"
							>
								Active Squad
								<RiTeamLine class="size-4 text-muted-foreground opacity-70" />
							</Card.Description>
						</Card.Header>
						<Card.Content class="p-4 pt-0">
							<div class="font-mono text-2xl font-bold tracking-tight text-foreground">
								{activeMembersCount}
							</div>
							<p class="mt-0.5 text-[11px] text-muted-foreground">Engineers & Core Leads</p>
						</Card.Content>
					</Card.Root>

					<!-- Stat 4 -->
					<Card.Root
						class="overflow-hidden rounded-2xl border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md"
					>
						<Card.Header class="p-4 pb-2">
							<Card.Description
								class="flex items-center justify-between text-xs font-medium text-muted-foreground"
							>
								Revisions Left
								<RiHistoryLine class="size-4 text-muted-foreground opacity-70" />
							</Card.Description>
						</Card.Header>
						<Card.Content class="p-4 pt-0">
							<div class="font-mono text-2xl font-bold tracking-tight text-foreground">
								{remainingRevisions}
							</div>
							<p class="mt-0.5 text-[11px] text-muted-foreground">
								From {project.allowed_revision_count} allocation unit
							</p>
						</Card.Content>
					</Card.Root>

					<!-- Stat 5 -->
					<Card.Root
						class="col-span-2 overflow-hidden rounded-2xl border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md lg:col-span-1"
					>
						<Card.Header class="p-4 pb-2">
							<Card.Description
								class="flex items-center justify-between text-xs font-medium text-muted-foreground"
							>
								Productive Power
								<RiFlagLine class="size-4 text-muted-foreground opacity-70" />
							</Card.Description>
						</Card.Header>
						<Card.Content class="p-4 pt-0">
							<div class="font-mono text-2xl font-bold tracking-tight text-foreground">
								{actualProgressPercentage}%
							</div>
							<p class="mt-0.5 text-[11px] text-muted-foreground">Weighted metric indices</p>
						</Card.Content>
					</Card.Root>
				</section>

				<!-- LAYOUT COMBINATION WORKSPACE -->
				<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<!-- LEFT / MAIN WORKSPACE AREA (2/3 Grid) -->
					<div class="space-y-6 lg:col-span-2">
						<Tabs.Root
							value={currentTab}
							onValueChange={(val) => (currentTab = val)}
							class="w-full space-y-4"
						>
							<div class="flex items-center justify-between border-b border-border pb-1">
								<Tabs.List class="h-10 gap-2 bg-transparent p-0">
									<Tabs.Trigger
										value="tasks"
										class="rounded-none border-b-2 border-transparent px-4 pt-2 pb-2 text-sm font-medium text-muted-foreground shadow-none transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:text-foreground"
									>
										Milestones & Tasks
									</Tabs.Trigger>
									<Tabs.Trigger
										value="members"
										class="rounded-none border-b-2 border-transparent px-4 pt-2 pb-2 text-sm font-medium text-muted-foreground shadow-none transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:text-foreground"
									>
										Team Engineers
									</Tabs.Trigger>
									<Tabs.Trigger
										value="revisions"
										class="rounded-none border-b-2 border-transparent px-4 pt-2 pb-2 text-sm font-medium text-muted-foreground shadow-none transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:text-foreground"
									>
										Audit Revisions
									</Tabs.Trigger>
								</Tabs.List>
							</div>

							<!-- TAB 1: PROGRESS / TASKS SECTION -->
							<Tabs.Content value="tasks" class="space-y-4 outline-none">
								<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div class="relative flex-1">
										<RiSearchLine
											class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
										/>
										<Input
											type="text"
											placeholder="Filter core milestones..."
											bind:value={searchQuery}
											class="h-9 rounded-xl border-border bg-card pl-9 text-xs ring-offset-background placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
										/>
									</div>
									<div class="flex items-center gap-2">
										<Button
											variant={filterStatus === 'all' ? 'secondary' : 'outline'}
											size="sm"
											onclick={() => (filterStatus = 'all')}
											class="h-8 rounded-lg text-xs"
										>
											All
										</Button>
										<Button
											variant={filterStatus === 'active' ? 'secondary' : 'outline'}
											size="sm"
											onclick={() => (filterStatus = 'active')}
											class="h-8 rounded-lg text-xs"
										>
											Active
										</Button>
										<Button
											variant={filterStatus === 'completed' ? 'secondary' : 'outline'}
											size="sm"
											onclick={() => (filterStatus = 'completed')}
											class="h-8 rounded-lg text-xs"
										>
											Done
										</Button>
									</div>
								</div>

								<!-- Task List UI Container -->
								<div class="space-y-2.5">
									{#if filteredProgressList.length === 0}
										<!-- EMPTY STATE MODERN -->
										<div
											class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center"
											transition:slide
										>
											<div class="mb-4 rounded-2xl bg-muted p-4 text-muted-foreground shadow-2xs">
												<RiInformationLine class="size-6" />
											</div>
											<h3 class="text-sm font-semibold text-foreground">
												No core milestones discovered
											</h3>
											<p class="mt-1 max-w-xs text-xs leading-normal text-muted-foreground">
												Tidak ada entitas data progress yang cocok dengan kata kunci pencarian atau
												filter aktif Anda.
											</p>
											<Button
												size="sm"
												variant="outline"
												class="mt-4 h-8 rounded-lg border-border bg-card text-xs"
												onclick={() => {
													searchQuery = '';
													filterStatus = 'all';
												}}
											>
												Reset Filter Criteria
											</Button>
										</div>
									{:else}
										{#each filteredProgressList as task (task.id)}
											<div
												class="group flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-muted-foreground/30 hover:shadow-xs"
												transition:slide={{ duration: 150 }}
											>
												<div class="flex flex-1 items-start gap-3.5">
													<button
														onclick={() => toggleTaskStatus(task.id)}
														class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-border text-primary-foreground transition-all duration-150 focus:ring-2 focus:ring-ring focus:outline-none {task.is_completed
															? 'border-primary bg-primary text-primary-foreground'
															: 'bg-background hover:border-muted-foreground'}"
														aria-label="Toggle task completeness status"
													>
														{#if task.is_completed}
															<svg
																class="size-3.5 stroke-[3]"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	d="M5 13l4 4L19 7"
																/>
															</svg>
														{/if}
													</button>

													<div class="flex-1 space-y-1.5">
														<span
															class="block text-xs leading-relaxed font-medium transition-all {task.is_completed
																? 'text-muted-foreground line-through opacity-70'
																: 'font-semibold text-foreground'}"
														>
															{task.title}
														</span>

														<!-- Metadata Row inside Task Item -->
														<div
															class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground"
														>
															<span class="flex items-center gap-1 font-sans">
																<Avatar.Root class="size-4 border border-border">
																	<Avatar.Fallback
																		class="bg-secondary text-[8px] font-bold text-secondary-foreground"
																		>{getInitials(task.member.user.full_name)}</Avatar.Fallback
																	>
																</Avatar.Root>
																{task.member.user.full_name}
															</span>
															<span>•</span>
															<span
																class="rounded bg-muted px-1.5 py-0.5 font-semibold text-foreground"
																>Weight: {task.weight}%</span
															>
															<span>•</span>
															<span>Registered {task.created_at}</span>
														</div>
													</div>
												</div>

												<div class="flex items-center">
													<Badge
														variant="outline"
														class="rounded-md border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase {task.is_completed
															? 'text-muted-foreground'
															: 'font-semibold text-primary'}"
													>
														{task.is_completed ? 'Resolved' : 'Active'}
													</Badge>
												</div>
											</div>
										{/each}
									{/if}
								</div>
							</Tabs.Content>

							<!-- TAB 2: TEAM MEMBERS SECTION -->
							<Tabs.Content value="members" class="outline-none">
								<Card.Root class="rounded-2xl border-border bg-card shadow-xs">
									<Card.Header class="p-6 pb-4">
										<Card.Title class="text-base font-bold text-foreground"
											>Active Operational Squad</Card.Title
										>
										<Card.Description class="text-xs text-muted-foreground"
											>Roster insinyur terpilih yang dialokasikan penuh ke kluster repositori ini.</Card.Description
										>
									</Card.Header>
									<Card.Content class="space-y-4 p-6 pt-0">
										{#each project.project_members as member (member.id)}
											<div
												class="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/50 p-3.5 transition-all hover:bg-muted/30"
											>
												<div class="flex items-center gap-3">
													<Avatar.Root
														class="size-10 border border-border shadow-xs ring-2 ring-background"
													>
														<Avatar.Fallback
															class="bg-secondary text-sm font-bold text-secondary-foreground"
															>{getInitials(member.user.full_name)}</Avatar.Fallback
														>
													</Avatar.Root>
													<div class="space-y-0.5">
														<div class="flex items-center gap-2">
															<span class="text-xs font-bold text-foreground"
																>{member.user.full_name}</span
															>
															{#if member.is_owner}
																<Badge
																	class="py-0.2 rounded border border-accent/30 bg-accent/20 px-1.5 text-[9px] font-bold tracking-wider text-accent uppercase"
																>
																	Owner
																</Badge>
															{/if}
														</div>
														<p class="font-mono text-[11px] text-muted-foreground">
															{member.user.email} — {member.role.role_name}
														</p>
													</div>
												</div>
												<div class="text-right font-mono text-[11px] text-muted-foreground">
													<p>Joined Squad</p>
													<p class="font-medium text-foreground">{member.joined_at}</p>
												</div>
											</div>
										{/each}
									</Card.Content>
								</Card.Root>
							</Tabs.Content>

							<!-- TAB 3: REVISION SECTION (Timeline Style) -->
							<Tabs.Content value="revisions" class="outline-none">
								<Card.Root class="rounded-2xl border-border bg-card shadow-xs">
									<Card.Header class="p-6 pb-4">
										<Card.Title class="text-base font-bold text-foreground"
											>Project Change Logs & Revisions</Card.Title
										>
										<Card.Description class="text-xs text-muted-foreground"
											>Manajemen kontrol revisi arsitektur pasca-tinjau komite.</Card.Description
										>
									</Card.Header>
									<Card.Content class="p-6 pt-0">
										{#if !project.project_revision || project.project_revision.length === 0}
											<div class="py-8 text-center text-xs text-muted-foreground">
												Tidak ada riwayat revisi terdaftar.
											</div>
										{:else}
											<div
												class="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-[1px] before:bg-border"
											>
												{#each project.project_revision as rev (rev.id)}
													<div class="relative space-y-2">
														<!-- Timeline dot indicator -->
														<div
															class="absolute top-1.5 -left-[21.5px] size-2 rounded-full border border-border bg-background ring-4 ring-background group-hover:bg-primary"
														></div>

														<div class="flex flex-wrap items-center justify-between gap-2">
															<h4 class="text-xs leading-snug font-bold text-foreground">
																{rev.title}
															</h4>
															<Badge
																variant="outline"
																class="py-0.2 rounded border-border bg-muted/60 px-1.5 font-mono text-[9px] text-foreground uppercase"
															>
																{rev.status}
															</Badge>
														</div>
														<p
															class="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs leading-relaxed text-muted-foreground"
														>
															<span
																class="mb-1 block font-mono text-[10px] font-bold tracking-wide text-foreground uppercase"
																>Reason of Modification:</span
															>
															{rev.reason}
														</p>
														<div class="font-mono text-[10px] text-muted-foreground">
															Logged timestamp: {rev.created_at}
														</div>
													</div>
												{/each}
											</div>
										{/if}
									</Card.Content>
								</Card.Root>
							</Tabs.Content>
						</Tabs.Root>
					</div>

					<!-- RIGHT SIDEBAR / METADATA SUMMARY PANEL (1/3 Grid) -->
					<div class="space-y-6 lg:col-span-1">
						<!-- Main Summary Card -->
						<Card.Root
							class="sticky top-24 overflow-hidden rounded-2xl border-border bg-card shadow-xs"
						>
							<div class="border-b border-border bg-muted/40 p-4">
								<h3
									class="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase"
								>
									<RiInformationLine class="size-4" />
									Operational Summary
								</h3>
							</div>

							<Card.Content class="space-y-4 p-5 text-xs">
								<!-- Item 1: Timeline Dates -->
								<div class="space-y-2">
									<span class="block font-medium text-muted-foreground"
										>Project Duration Lifecycle</span
									>
									<div class="space-y-2 rounded-xl border border-border bg-background p-3">
										<div class="flex items-center justify-between font-mono">
											<span class="flex items-center gap-1.5 text-muted-foreground"
												><RiCalendarLine class="size-3.5" /> Start</span
											>
											<span class="font-semibold text-foreground"
												>{project.actual_start_date || 'N/A'}</span
											>
										</div>
										<Separator class="bg-border/60" />
										<div class="flex items-center justify-between font-mono">
											<span class="flex items-center gap-1.5 text-muted-foreground"
												><RiTimeLine class="size-3.5" /> Expected End</span
											>
											<span class="font-semibold text-foreground">{project.end_date || 'N/A'}</span>
										</div>
									</div>
								</div>

								<!-- Item 2: Quick Status Indicator Overview -->
								<div class="space-y-1.5">
									<div class="flex justify-between">
										<span class="font-medium text-muted-foreground">Status System Overview</span>
										<span class="font-mono font-semibold text-foreground">{project.status}</span>
									</div>
									<div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
										<div
											class="h-full rounded-full bg-primary"
											style="width: {actualProgressPercentage}%"
										></div>
									</div>
								</div>

								<Separator class="bg-border" />

								<!-- Item 3: Grid Detail List -->
								<div class="space-y-3 font-mono">
									<div class="flex items-center justify-between">
										<span class="font-sans text-muted-foreground">Internal Project ID</span>
										<span
											class="rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-foreground select-all"
											>{project.id}</span
										>
									</div>
									<div class="flex items-center justify-between">
										<span class="font-sans text-muted-foreground">Procurement Order</span>
										<span class="text-[11px] font-semibold text-foreground">{project.order_id}</span
										>
									</div>
									<div class="flex items-center justify-between">
										<span class="font-sans text-muted-foreground">Revision Guard Barrier</span>
										<span class="text-[11px] font-semibold text-foreground"
											>{project.project_revision?.length || 0} / {project.allowed_revision_count} Max</span
										>
									</div>
									<div class="flex items-center justify-between">
										<span class="font-sans text-muted-foreground">Total Member Engaged</span>
										<span class="text-[11px] font-semibold text-foreground"
											>{activeMembersCount} Allocated</span
										>
									</div>
								</div>

								<Separator class="bg-border" />

								<!-- Item 4: Mini Avatar Interactive Group -->
								<div class="space-y-2">
									<span class="block font-medium text-muted-foreground">Squad Visual Roster</span>
									<div class="flex items-center -space-x-2 overflow-hidden py-1">
										{#each project.project_members as m}
											<div
												class="flex inline-block size-7 cursor-help items-center justify-center rounded-full border-2 border-card bg-secondary font-mono text-[9px] font-bold text-secondary-foreground shadow-2xs"
												title={m.user.full_name}
											>
												{getInitials(m.user.full_name)}
											</div>
										{/each}
									</div>
								</div>

								<div class="pt-2">
									<Button
										class="h-9 w-full rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
									>
										<RiAddLine class="mr-1 size-4" />
										Deploy Production Patch
									</Button>
								</div>
							</Card.Content>
						</Card.Root>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>
